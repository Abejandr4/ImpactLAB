// src/utils/Operaciones.js

/**
 * Simulador Completo de Impacto de Asteroides 🚀
 *
 * Lógica de cálculo basada en:
 *   [C2005] Collins, G. S., Melosh, H. J., & Marcus, R. A. (2005).
 *           "Earth Impact Effects Program". Meteoritics & Planetary Science 40(6), 817-840.
 *   [M2022] Morais, R. H., Santos, L. F. F. M., Silva, A. R. R., & Melicio, R. (2022).
 *           "Short-Term Consequences of Asteroid Impacts into the Ocean". Universe 8, 279.
 *           (de aquí provienen los modelos de vulnerabilidad de Rumpf et al. 2017)
 *   [R2017] Rumpf, C. M., Lewis, H. G., & Atkinson, P. M. (2017).
 *           "Population vulnerability models for asteroid impact risk assessment".
 *           Meteoritics & Planetary Science 52, 1082-1102.
 *
 * Las ecuaciones de [C2005] referenciadas abajo como "Ec. N" corresponden a la
 * numeración del paper original (las que el paper marca con asterisco en el código).
 *
 * AJUSTES LOCALES PARA EL ESTADO DE PUEBLA:
 *   - Objetivo (target): roca cristalina/volcánica. El Eje Neovolcánico atraviesa
 *     Puebla (La Malinche, Popocatépetl), así que se usa rho_t = 2750 kg/m³
 *     (valor de [C2005] para "crystalline rock"). Si se sabe que el sitio puntual
 *     es de relleno sedimentario lacustre (valles de Puebla-Tlaxcala), puede
 *     cambiarse a 2500 kg/m³.
 *   - Letalidad: se usan los modelos de vulnerabilidad calibrados de [R2017]/[M2022]
 *     (escenario "expected") en lugar de un logístico ad-hoc. Ver notas en
 *     calculateVulnerabilities() sobre por qué "expected" es razonable para Puebla.
 *
 * Función pura: no depende de React, solo calcula. Optimizada para impactos en TIERRA.
 *
 * @param {object} params - Parámetros de entrada.
 * @returns {object} - Resultados detallados de la simulación.
 */

export const simulateAsteroidImpact = ({
  diameter_km,
  density_kgm3,
  velocity_kms,
  angle_deg,
  distance_from_impact_km,
  lat,
  lng,
  geoJsonData,
  targetType = "land", // Solo se admite 'land'
}) => {
  // --- CONSTANTES GLOBALES Y FÍSICAS ---
  const CONST = {
    // Densidad del objetivo. Puebla: roca cristalina/volcánica del Eje Neovolcánico.
    // [C2005] asigna 2750 kg/m³ a "crystalline rock", 2500 a "sedimentary rock".
    RHO_T_CRYSTALLINE: 2750.0,
    G_E: 9.8, // Gravedad superficial (m/s²) [C2005]
    H: 8000.0, // Altura de escala atmosférica (m) [C2005, Ec. 5]
    RHO_0: 1.0, // Densidad del aire en superficie (kg/m³) [C2005, Ec. 5]
    C_D: 2.0, // Coef. de arrastre [C2005, Ec. 6]
    PI: Math.PI,
    R_E: 6.371e6, // Radio terrestre (m)
    STEFAN_BOLTZMANN: 5.67e-8, // σ (W m⁻² K⁻⁴) [C2005, Ec. 35]
    T_STAR: 3000, // Temperatura de transparencia (K) [C2005, Ec. 35]
    SOUND_SPEED_AIR: 330, // c₀ (m/s) [C2005, Ec. 59]
    ATM_PRESSURE: 101325, // P₀ ≈ 1 bar (Pa) [C2005]
    // NOTA: NO se define una SEISMIC_EFFICIENCY como constante separada.
    // En [C2005] la eficiencia sísmica (1e-4, rango 1e-5 a 1e-3) ya está
    // embebida en la constante -5.87 de la Ec. 40. Añadirla aparte rompería
    // la consistencia de la fórmula. El valor 5e-4 "según InSight" es de Marte
    // (Fernando et al. 2022, Nature Astronomy) y NO aplica a la Tierra.
  };

  // --- CONVERSIÓN DE UNIDADES A SI ---
  const L0_m = diameter_km * 1000.0;
  const v0_ms = velocity_kms * 1000.0;
  const theta_rad = (angle_deg * CONST.PI) / 180.0;
  const r_m = distance_from_impact_km * 1000.0;

  // --- MÓDULOS DE CÁLCULO (Funciones internas) ---

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radio terrestre (m)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * Suma una propiedad (POBTOT, TVIVHAB...) de todas las manzanas censales
   * cuyo centroide cae dentro de `radiusMeters` del punto de impacto.
   * Esto se llama una vez por cada radio de efecto (cráter, onda de choque,
   * térmico), NO solo para el cráter. Ver nota en la lógica principal.
   */
  const calculateImpactData = (impactLat, impactLon, radiusMeters, propertyKey) => {
    if (!geoJsonData || !geoJsonData.features) return 0;
    if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) return 0;

    // Centroide de área (fórmula del polígono ponderada por área).
    // Más preciso que el promedio simple de vértices para manzanas
    // irregulares o alargadas.
    const getCentroid = (geometry) => {
      let ring;
      if (geometry.type === "MultiPolygon") {
        ring = geometry.coordinates[0][0];
      } else if (geometry.type === "Polygon") {
        ring = geometry.coordinates[0];
      } else {
        return null;
      }
      if (!ring || ring.length < 3) return null;

      let area = 0;
      let cx = 0;
      let cy = 0;
      let valid = 0;
      for (let i = 0; i < ring.length - 1; i++) {
        const p0 = ring[i];
        const p1 = ring[i + 1];
        if (
          !Array.isArray(p0) ||
          !Array.isArray(p1) ||
          !Number.isFinite(p0[0]) ||
          !Number.isFinite(p0[1]) ||
          !Number.isFinite(p1[0]) ||
          !Number.isFinite(p1[1])
        ) {
          continue;
        }
        const cross = p0[0] * p1[1] - p1[0] * p0[1];
        area += cross;
        cx += (p0[0] + p1[0]) * cross;
        cy += (p0[1] + p1[1]) * cross;
        valid++;
      }
      if (valid === 0) return null;

      // Degenera (área ~0): usa promedio simple de vértices como respaldo.
      if (Math.abs(area) < 1e-12) {
        let sLon = 0;
        let sLat = 0;
        let n = 0;
        for (const p of ring) {
          if (Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1])) {
            sLon += p[0];
            sLat += p[1];
            n++;
          }
        }
        return n === 0 ? null : [sLon / n, sLat / n];
      }

      area *= 0.5;
      cx /= 6 * area;
      cy /= 6 * area;
      return [cx, cy]; // [lon, lat]
    };

    return geoJsonData.features.reduce((total, feature) => {
      try {
        if (!feature.geometry) return total;
        const centroid = getCentroid(feature.geometry);
        if (!centroid) return total;

        const distance = getDistance(
          impactLat,
          impactLon,
          centroid[1], // lat
          centroid[0] // lon
        );

        if (distance <= radiusMeters) {
          return total + Number(feature.properties[propertyKey] || 0);
        }
      } catch (e) {
        // Manzana con geometría inválida: se ignora.
      }
      return total;
    }, 0);
  };

  // ---------------------------------------------------------------------------
  // MODELOS DE VULNERABILIDAD / LETALIDAD  [R2017] vía [M2022]
  // ---------------------------------------------------------------------------
  // Estos modelos están calibrados con datos reales de víctimas, NO son un
  // logístico ad-hoc. Cada efecto tiene su propia función con la unidad
  // correcta de intensidad. Se usa el escenario "expected".
  //
  // ¿Por qué "expected" para Puebla? [R2017] define:
  //   - best:     población totalmente resguardada (solo afectada vía ventanas)
  //   - expected: ~47% de la población sin resguardo
  //   - worst:    100% de la población expuesta
  // Para zonas urbanas densas con construcción mixta (mampostería/concreto y
  // vivienda informal) como las del estado de Puebla, "expected" es la elección
  // central razonable. Se exponen también best y worst para dar el rango de
  // incertidumbre, tal como hace [M2022].
  // ---------------------------------------------------------------------------

  // Sobrepresión (p en Pa). [M2022] Ec. 35 + Tabla 3.
  // Vp = 1 / (1 + e^(a·(p + b))), con a·1e5 y b·1e-5 según escenario.
  const VULN_OVERPRESSURE = {
    best: { a: -1.9e-5, b: -5.43e5 },
    expected: { a: -2.42e-5, b: -4.4e5 },
    worst: { a: -2.85e-5, b: -3.53e5 },
  };
  const vulnerabilityOverpressure = (p_Pa, scenario = "expected") => {
    const { a, b } = VULN_OVERPRESSURE[scenario];
    const v = 1 / (1 + Math.exp(a * (p_Pa + b)));
    return Math.min(Math.max(v, 0), 1);
  };

  // Radiación térmica (φ en J/m²). [M2022] Ec. 36 + Tabla 4.
  // Vφ = a / (1 + e^(b·(φ + c))). Nótese que el máximo es 'a' (no 1):
  // refleja que parte de la población está resguardada / vestida.
  const VULN_THERMAL = {
    best: { a: 0.25, b: -5.62e-6, c: -7.32e5 },
    expected: { a: 0.47, b: -5.62e-6, c: -7.32e5 },
    worst: { a: 1.0, b: -5.62e-6, c: -7.32e5 },
  };
  const vulnerabilityThermal = (phi_Jm2, scenario = "expected") => {
    const { a, b, c } = VULN_THERMAL[scenario];
    const v = a / (1 + Math.exp(b * (phi_Jm2 + c)));
    return Math.min(Math.max(v, 0), 1);
  };

  // Sismo (Meff en escala Richter). [M2022] Ec. 34 + Tabla 2.
  // Vseis = 1 / (1 + e^(a·(Meff + b))).
  const VULN_SEISMIC = {
    best: { a: -2.51, b: -9.59 },
    expected: { a: -2.52, b: -8.69 },
    worst: { a: -3.8, b: -7.6 },
  };
  const vulnerabilitySeismic = (m_eff, scenario = "expected") => {
    const { a, b } = VULN_SEISMIC[scenario];
    const v = 1 / (1 + Math.exp(a * (m_eff + b)));
    return Math.min(Math.max(v, 0), 1);
  };

  // Eyecta (carga del manto pe en kPa). [M2022] Ec. 37-38 + Tabla 5.
  // pe = te·ρe·g0  (ρe = 1600 kg/m³). Ve = 0.078 / (1 + e^(a·(pe + b)))^c.
  // El tope 0.078 viene de 0.78·0.2·0.5 (fracción de población interior que
  // queda atrapada y fallece en un colapso de techo).
  const VULN_EJECTA = {
    best: { a: -1.0, b: -5.84, c: -2.58 },
    expected: { a: -1.37, b: -3.14, c: -4.6 },
    worst: { a: -4.32, b: -1.61, c: -4.13 },
  };
  const EJECTA_DENSITY = 1600.0; // kg/m³ [M2022]
  const vulnerabilityEjecta = (te_m, scenario = "expected") => {
    const pe_kPa = (te_m * EJECTA_DENSITY * CONST.G_E) / 1000.0; // Pa -> kPa
    const { a, b, c } = VULN_EJECTA[scenario];
    const v = 0.078 / Math.pow(1 + Math.exp(a * (pe_kPa + b)), c);
    return Math.min(Math.max(v, 0), 0.078);
  };

  // ---------------------------------------------------------------------------
  // ENTRADA ATMOSFÉRICA  [C2005] Ec. 5-20
  // ---------------------------------------------------------------------------
  const calculateAtmosphericEntry = () => {
    // Resistencia del impactor: log10(Yi) = 2.107 + 0.0624·√ρ  [C2005, Ec. 9]
    const log_Yi = 2.107 + 0.0624 * Math.sqrt(density_kgm3);
    const Yi = Math.pow(10, log_Yi);

    // Criterio de fragmentación If  [C2005, Ec. 12]:
    //   If = 4.07 · (Cd·H·Yi) / (ρi·L0·v0²·sinθ)
    // (versión correcta del paper; reemplaza el ln(...) que tenías antes)
    const If =
      (4.07 * CONST.C_D * CONST.H * Yi) /
      (density_kgm3 * L0_m * Math.pow(v0_ms, 2) * Math.sin(theta_rad));

    if (!Number.isFinite(If) || If <= 0) {
      return {
        error:
          "Parámetros no físicos para fragmentación. Revisa diámetro, densidad, velocidad o ángulo.",
      };
    }

    if (If >= 1) {
      // El impactor llega intacto a la superficie [C2005, p.820].
      // Velocidad decrementada por arrastre  [C2005, Ec. 8]:
      //   v(z) = v0 · exp( -3·ρ(z)·Cd·H / (4·ρi·L0·sinθ) ), evaluada en z=0
      const exponent =
        -(3 * CONST.RHO_0 * CONST.C_D * CONST.H) /
        (4 * density_kgm3 * L0_m * Math.sin(theta_rad));
      const v_impact = v0_ms * Math.exp(exponent);
      return { isAirburst: false, impactVelocity: v_impact };
    }

    // If < 1 -> hay ruptura. Altitud de ruptura z*  [C2005, Ec. 11]:
    //   z* = -H·[ ln(Yi/(ρ0·v0²)) + 1.308 - 0.314·If - 1.303·√(1-If) ]
    const z_star =
      -CONST.H *
      (Math.log(Yi / (CONST.RHO_0 * Math.pow(v0_ms, 2))) +
        1.308 -
        0.314 * If -
        1.303 * Math.sqrt(1 - If));

    const rho_z_star = CONST.RHO_0 * Math.exp(-z_star / CONST.H); // [C2005, Ec. 5]

    // Escala de dispersión l  [C2005, Ec. 16]:
    //   l = L0·sinθ·√( ρi / (Cd·ρ(z*)) )
    const l =
      L0_m *
      Math.sin(theta_rad) *
      Math.sqrt(density_kgm3 / (CONST.C_D * rho_z_star));

    // Altitud de airburst zb (donde L(z)/L0 = fp = 7)  [C2005, Ec. 18]:
    //   zb = z* - 2H·ln( 1 + (l/2H)·√(fp²-1) )
    const fp = 7.0;
    const alpha = Math.sqrt(fp * fp - 1); // α ≡ √(fp²-1)  [C2005, Ec. 19]
    const zb = z_star - 2 * CONST.H * Math.log(1 + (l / (2 * CONST.H)) * alpha);

    // Velocidad en z*  [C2005, Ec. 8 evaluada en z*]
    const v_at_z_star =
      v0_ms *
      Math.exp(
        -(3 * rho_z_star * CONST.C_D * CONST.H) /
          (4 * density_kgm3 * L0_m * Math.sin(theta_rad))
      );

    if (zb > 0) {
      // AIRBURST: el grueso de la energía se deposita en el aire [C2005].
      // Velocidad residual del enjambre  [C2005, Ec. 17 + integral Ec. 19].
      const integral_19 =
        ((l * L0_m * L0_m) / 24) *
        (alpha *
          (8 * (3 + alpha * alpha) +
            3 * (l / CONST.H) * (2 + alpha * alpha)));
      const exponent_v =
        (-(3 * CONST.C_D * rho_z_star) /
          (4 * density_kgm3 * Math.pow(L0_m, 3) * Math.sin(theta_rad))) *
        integral_19;
      const v_burst = v_at_z_star * Math.exp(exponent_v);

      // Energía depositada en el airburst = energía cinética del enjambre.
      // E = (π/12)·ρ·L0³·v²   [C2005, Ec. 1]
      const energy =
        (CONST.PI / 12) *
        density_kgm3 *
        Math.pow(L0_m, 3) *
        Math.pow(v_burst, 2);
      return {
        isAirburst: true,
        burstAltitude: zb,
        burstVelocity: v_burst,
        energy: energy,
      };
    }

    // zb <= 0: el "pancake" no alcanza el tamaño límite antes de tocar
    // suelo -> impacto en superficie del enjambre  [C2005, Ec. 17 + Ec. 20].
    const ez = Math.exp(z_star / CONST.H);
    const integral_20 =
      ((Math.pow(CONST.H, 3) * L0_m * L0_m) / (3 * l * l)) *
      (3 * (4 * Math.pow(l / CONST.H, 2) + 1) * ez +
        6 * Math.pow(ez, 2) -
        16 * Math.pow(ez, 1.5) -
        3 * Math.pow(l / CONST.H, 2) -
        2);
    const exponent_v =
      (-(3 * CONST.C_D * rho_z_star) /
        (4 * density_kgm3 * Math.pow(L0_m, 3) * Math.sin(theta_rad))) *
      integral_20;
    const v_impact = v_at_z_star * Math.exp(exponent_v);
    return { isAirburst: false, impactVelocity: v_impact };
  };

  // ---------------------------------------------------------------------------
  // CRÁTER  [C2005] Ec. 21-27
  // ---------------------------------------------------------------------------
  const calculateCrater = (rho_i, v_i, L0, rho_t) => {
    // Diámetro transitorio  [C2005, Ec. 21]:
    //   D_tc = 1.161·(ρi/ρt)^(1/3)·L^0.78·v^0.44·g^-0.22·sin^(1/3)θ
    const factor_densidad = Math.pow(rho_i / rho_t, 1 / 3);
    const D_tc_m =
      1.161 *
      factor_densidad *
      Math.pow(L0, 0.78) *
      Math.pow(v_i, 0.44) *
      Math.pow(CONST.G_E, -0.22) *
      Math.pow(Math.sin(theta_rad), 1 / 3);
    const D_tc_km = D_tc_m / 1000;

    // Dc = diámetro de transición simple/complejo del cráter FINAL = 3.2 km.
    // El umbral de decisión sobre el cráter TRANSITORIO es 2.56 km
    // (textual en [C2005], p.824, justo antes de Ec. 27).
    const Dc_km = 3.2;
    let D_fr_m = 0;
    let type = "";
    let depth_m = 0;

    if (D_tc_km < 2.56) {
      // Cráter simple  [C2005, Ec. 22]:  D_fr ≈ 1.25·D_tc
      type = "Simple";
      D_fr_m = 1.25 * D_tc_m;
      // Profundidad transitoria  [C2005, Ec. 25]:  d_tc = D_tc/(2√2)
      const d_tc_m = D_tc_m / (2 * Math.sqrt(2));
      // Altura del borde  [C2005, Ec. 48]:  h_fr = 0.07·D_tc⁴/D_fr³
      const h_fr_m = 0.07 * Math.pow(D_tc_m, 4) / Math.pow(D_fr_m, 3);
      // Espesor de la lente de brecha  [C2005, Ec. 24] con Vbr=0.032·Dfr³ (Ec.23):
      //   t_br = 2.8·Vbr·(d_tc+h_fr)/(d_tc·D_fr²)
      const V_br = 0.032 * Math.pow(D_fr_m, 3);
      const t_br_m =
        (2.8 * V_br * (d_tc_m + h_fr_m)) / (d_tc_m * D_fr_m * D_fr_m);
      // Profundidad final  [C2005, Ec. 26]:  d_fr = d_tc + h_fr - t_br
      depth_m = d_tc_m + h_fr_m - t_br_m;
    } else {
      // Cráter complejo  [C2005, Ec. 27]:
      //   D_fr = 1.17·D_tc^1.13 / Dc^0.13   (Dtc, Dfr, Dc en km)
      type = "Complex";
      const D_fr_km = (1.17 * Math.pow(D_tc_km, 1.13)) / Math.pow(Dc_km, 0.13);
      D_fr_m = D_fr_km * 1000;
      // Profundidad complejo  [C2005, Ec. 28]:  d_fr = 0.4·D_fr^0.3 (km)
      depth_m = 0.4 * Math.pow(D_fr_km, 0.3) * 1000;
    }

    // ---- VOLUMEN FUNDIDO (impact melt)  [C2005] Ec. 30-31 ----
    // Vm = 8.9e-12 · E · sinθ   (m³, E en J)  [C2005, Ec. 30]
    // Salvedades del propio paper:
    //   - Requiere v > ~12 km/s (umbral de fusión significativa). Por debajo,
    //     el fundido es despreciable -> se reporta 0.
    //   - Para θ ≤ 15° la fórmula sobreestima Vm por factor ~2 (se anota flag).
    //   - Para hielo sería ~10×, pero Puebla es roca volcánica -> no aplica.
    let meltVolume_m3 = 0;
    let meltThickness_m = 0;
    let meltNote = "";
    if (v_i / 1000 < 12) {
      meltNote =
        "Velocidad de impacto < 12 km/s: producción de fundido despreciable.";
    } else {
      const E_for_melt =
        (CONST.PI / 12) * rho_i * Math.pow(L0, 3) * Math.pow(v_i, 2); // [C2005, Ec.1]
      meltVolume_m3 = 8.9e-12 * E_for_melt * Math.sin(theta_rad);
      // Espesor de la lámina de fundido  [C2005, Ec. 31]:  tm = 4·Vm/(π·D_tc²)
      // Físicamente coherente sobre todo en cráteres complejos (lámina
      // continua); en simples el fundido va mezclado en la lente de brecha.
      meltThickness_m =
        (4 * meltVolume_m3) / (CONST.PI * Math.pow(D_tc_m, 2));
      if (angle_deg <= 15) {
        meltNote =
          "Ángulo ≤ 15°: [C2005] advierte que Vm puede estar sobreestimado por un factor ~2.";
      }
    }

    return {
      transientDiameter_m: D_tc_m,
      finalDiameter_m: D_fr_m,
      finalDepth_m: depth_m,
      type: type,
      meltVolume_m3: meltVolume_m3,
      meltVolume_km3: meltVolume_m3 / 1e9,
      meltThickness_m: meltThickness_m,
      meltNote: meltNote,
    };
  };

  // ---------------------------------------------------------------------------
  // RADIACIÓN TÉRMICA  [C2005] Ec. 32-39
  // ---------------------------------------------------------------------------
  // r_obs_m: distancia del observador. effectiveDistance permite que la lógica
  // principal sondee distintos radios para contar población afectada.
  const calculateThermalRadiation = (energy_j, r_obs_m) => {
    // Vaporización (y por tanto bola de fuego) solo si v > 15 km/s  [C2005].
    if (velocity_kms <= 15) {
      return {
        applies: false,
        message:
          "Velocidad < 15 km/s: no se genera una bola de fuego significativa (sin vaporización).",
      };
    }

    // Radio de la bola de fuego  [C2005, Ec. 32]:  Rf = 0.002·E^(1/3)
    const fireball_radius_m = 0.002 * Math.pow(energy_j, 1 / 3);

    const eta = 3.0e-3; // Eficiencia luminosa η  [C2005, Ec. 34] (rango 1e-4..1e-2)

    // Exposición térmica base  [C2005, Ec. 34]:  Φ = η·E / (2π·r²)
    const phi_base = (eta * energy_j) / (2 * CONST.PI * Math.pow(r_obs_m, 2));

    // ---- Corrección por curvatura terrestre / horizonte  [C2005, Ec. 36-37] ----
    // Ángulo epicentral Δ = r/RE ; altura de la bola bajo el horizonte
    //   h = (1 - cosΔ)·RE
    const delta = r_obs_m / CONST.R_E;
    const h = (1 - Math.cos(delta)) * CONST.R_E;

    let f; // fracción de bola de fuego visible sobre el horizonte
    if (h >= fireball_radius_m) {
      // Bola completamente bajo el horizonte: sin radiación directa.
      f = 0;
    } else {
      // δ_h = acos(h/Rf) ; f = (2/π)·( δ_h - (h/Rf)·sin δ_h )  [C2005, Ec. 36]
      const ratio = h / fireball_radius_m;
      const delta_h = Math.acos(ratio);
      f = (2 / CONST.PI) * (delta_h - ratio * Math.sin(delta_h));
      f = Math.min(Math.max(f, 0), 1);
    }

    const thermal_exposure_Jm2 = f * phi_base;

    // Duración de irradiación τ  [C2005, Ec. 35]:
    //   τ = η·E / (2π·Rf²·σ·T*⁴)
    const tau_s =
      (eta * energy_j) /
      (2 *
        CONST.PI *
        Math.pow(fireball_radius_m, 2) *
        CONST.STEFAN_BOLTZMANN *
        Math.pow(CONST.T_STAR, 4));

    // Ignición/quemaduras: umbral 1 Mt escalado por E_Mt^(1/6)  [C2005, Ec. 39].
    // Valores de la Tabla 1 de [C2005] (datos de Glasstone & Dolan 1977).
    const ignitionData = {
      Ropa: 1.0e6,
      Madera_contrachapada: 0.67e6,
      Pasto: 0.38e6,
      Periodico: 0.33e6,
      Arboles_caducifolios: 0.25e6,
      "Quemaduras_3er_grado": 0.42e6,
      "Quemaduras_2do_grado": 0.25e6,
      "Quemaduras_1er_grado": 0.13e6,
    };
    const energy_Mt = energy_j / 4.184e15;
    const effects = [];
    for (const material in ignitionData) {
      const threshold = ignitionData[material] * Math.pow(energy_Mt, 1 / 6);
      if (thermal_exposure_Jm2 > threshold) {
        effects.push(material.replace(/_/g, " "));
      }
    }

    return {
      applies: true,
      fireballRadius_km: fireball_radius_m / 1000,
      fireballRadius_m: fireball_radius_m,
      horizonFraction: f,
      thermalExposure_Jm2: thermal_exposure_Jm2,
      irradiationDuration_s: tau_s,
      ignitionEffects:
        effects.length > 0
          ? effects.join(", ")
          : "No se prevé ignición ni quemaduras a esta distancia.",
    };
  };

  // ---------------------------------------------------------------------------
  // SISMO  [C2005] Ec. 40-42
  // ---------------------------------------------------------------------------
  const calculateSeismicEffects = (energy_j, r_obs_m) => {
    // Magnitud Richter  [C2005, Ec. 40]:  M = 0.67·log10(E) - 5.87
    const richter_magnitude = 0.67 * Math.log10(energy_j) - 5.87;
    const r_km = r_obs_m / 1000;

    // Magnitud efectiva por atenuación con distancia  [C2005, Ec. 41a/b/c]:
    //   r < 60 km:        Meff = M - 0.0238·r
    //   60 ≤ r < 700 km:  Meff = M - 0.0048·r - 1.1644
    //   r ≥ 700 km:       Meff = M - 1.66·log10(Δ) - 6.399   (Δ = r/RE, radianes)
    // CORRECCIÓN: el tramo lejano usa el ÁNGULO EPICENTRAL Δ en radianes y la
    // constante 6.399 (antes tenías log10(r_km) y -3.44, ambos incorrectos).
    let M_eff;
    if (r_km < 60) {
      M_eff = richter_magnitude - 0.0238 * r_km;
    } else if (r_km < 700) {
      M_eff = richter_magnitude - 0.0048 * r_km - 1.1644;
    } else {
      const delta = r_obs_m / CONST.R_E; // ángulo epicentral (rad)
      M_eff = richter_magnitude - 1.66 * Math.log10(delta) - 6.399;
    }

    // Intensidad Mercalli  [C2005, Tabla 2] (mapeo corregido y alineado):
    //   0-1: –   | 1-2: I | 2-3: I-II | 3-4: III-IV | 4-5: IV-V
    //   5-6: VI-VII | 6-7: VII-VIII | 7-8: IX-X | 8-9: X-XI | 9+: XII
    let mercalli;
    if (M_eff < 1) mercalli = "–";
    else if (M_eff < 2) mercalli = "I";
    else if (M_eff < 3) mercalli = "I-II";
    else if (M_eff < 4) mercalli = "III-IV";
    else if (M_eff < 5) mercalli = "IV-V";
    else if (M_eff < 6) mercalli = "VI-VII (Daños leves)";
    else if (M_eff < 7) mercalli = "VII-VIII (Daño moderado)";
    else if (M_eff < 8) mercalli = "IX-X (Daño severo)";
    else if (M_eff < 9) mercalli = "X-XI (Destrucción)";
    else mercalli = "XII (Destrucción casi total)";

    return {
      richterMagnitude: richter_magnitude,
      effectiveMagnitude: M_eff,
      mercalliIntensity: mercalli,
      arrival_time_s: r_km / 5.0, // [C2005, Ec. 42] ondas superficiales ~5 km/s
    };
  };

  // ---------------------------------------------------------------------------
  // EYECTA  [C2005] Ec. 47, 49-53
  // ---------------------------------------------------------------------------
  const calculateEjecta = (crater_D_tc_m, crater_D_fr_m, r_obs_m, energy_j, fireball_radius_m) => {
    // Espesor del manto de eyecta  [C2005, Ec. 47]:  te = D_tc⁴ / (112·r³)
    const thickness_m = Math.pow(crater_D_tc_m, 4) / (112 * Math.pow(r_obs_m, 3));
    const r_km = r_obs_m / 1000;
    const D_fr_km = crater_D_fr_m / 1000;

    // ---- ALCANCE MÁXIMO DE LA EYECTA  [C2005, p.829] ----
    // Para E < 200 Mt la atmósfera densa frena los fragmentos en el borde del
    // fireball -> el alcance se limita al radio de la bola de fuego.
    // Para E ≥ 200 Mt la eyecta escapa de la atmósfera densa y llega mucho
    // más lejos (límite práctico ~10,000 km, donde domina vapor condensado).
    const energy_Mt = energy_j / 4.184e15;
    let maxReach_m;
    let reachNote;
    if (energy_Mt < 200) {
      maxReach_m = fireball_radius_m || 0;
      reachNote =
        "E < 200 Mt: el alcance de la eyecta rocosa se limita al radio de la bola de fuego (la atmósfera densa la frena).";
    } else {
      maxReach_m = 1.0e7; // ~10,000 km  [C2005]
      reachNote =
        "E ≥ 200 Mt: la eyecta escapa de la atmósfera densa; más allá de ~10,000 km domina el vapor condensado del impactor.";
    }

    // ---- TIEMPO DE LLEGADA BALÍSTICO al observador  [C2005, Ec. 49-52] ----
    // Asume ángulo de eyección de 45° sobre Tierra esférica.
    // Δ = r/RE ; ve² = 2·gE·RE·tan(Δ/2)/(1+tan(Δ/2))  [Ec. 52]
    // e² = ½·[ (ve²/(gE·RE) − 1)² + 1 ]                [Ec. 50]
    // a  = ve² / (2·gE·(1−e²))                         [Ec. 51]
    // Te = (2·a^1.5)/(√(gE·RE²)) · [ 2·atan(√((1−e)/(1+e))·tan(Δ/4))
    //        − ( e·√(1−e²)·sin(Δ/2) / (1+e·cos(Δ/2)) ) ]   [Ec. 49]
    let ejectaArrival_s = null;
    let arrivalNote = "";
    const delta = r_obs_m / CONST.R_E; // ángulo epicentral (rad)
    if (delta > 0) {
      const tanHalf = Math.tan(delta / 2);
      const ve2 =
        (2 * CONST.G_E * CONST.R_E * tanHalf) / (1 + tanHalf);
      if (ve2 / (CONST.G_E * CONST.R_E) <= 1) {
        const e2 =
          0.5 * (Math.pow(ve2 / (CONST.G_E * CONST.R_E) - 1, 2) + 1);
        const e = -Math.sqrt(e2); // e negativa cuando ve²/(gE·RE) ≤ 1  [C2005]
        const a = ve2 / (2 * CONST.G_E * (1 - e2));
        const term1 =
          2 *
          Math.atan(
            Math.sqrt((1 - e) / (1 + e)) * Math.tan(delta / 4)
          );
        const term2 =
          (e * Math.sqrt(1 - e2) * Math.sin(delta / 2)) /
          (1 + e * Math.cos(delta / 2));
        ejectaArrival_s =
          ((2 * Math.pow(a, 1.5)) /
            Math.sqrt(CONST.G_E * CONST.R_E * CONST.R_E)) *
          (term1 - term2);
        if (r_obs_m > 1.0e7) {
          arrivalNote =
            "r > 10,000 km: tiempo de eyecta > 1 h; la rotación terrestre y el reingreso atmosférico (no modelados) dominan; predomina vapor condensado.";
        }
      } else {
        arrivalNote =
          "Distancia fuera del rango de validez balística de [C2005, Ec. 49].";
      }
    }

    // No se calcula tamaño de fragmento dentro de 2 radios de cráter  [C2005, p.829].
    if (r_km < D_fr_km / 2) {
      return {
        insideCrater: true,
        thickness_m: thickness_m,
        maxReach_km: maxReach_m / 1000,
        reachNote: reachNote,
        arrivalTime_s: ejectaArrival_s,
        arrivalNote: arrivalNote,
        message: "Ubicación dentro del cráter final.",
      };
    }

    // Diámetro medio de fragmento  [C2005, Ec. 53]:
    //   d = dc·(D_fr/2r)^α ,  α=2.65,  dc = 2400·(D_fr/2)^-1.62  (km)
    const dc = 2400 * Math.pow(D_fr_km / 2, -1.62);
    const alpha = 2.65;
    const fragment_size_m = dc * Math.pow(D_fr_km / (2 * r_km), alpha);

    return {
      insideCrater: false,
      thickness_m: thickness_m,
      meanFragmentSize_mm: fragment_size_m * 1000,
      maxReach_km: maxReach_m / 1000,
      reachNote: reachNote,
      arrivalTime_s: ejectaArrival_s,
      arrivalNote: arrivalNote,
    };
  };

  // ---------------------------------------------------------------------------
  // ONDA DE CHOQUE  [C2005] Ec. 54-59
  // ---------------------------------------------------------------------------
  const calculateAirBlast = (energy_j, isAirburst, r_obs_m, burstAltitude_m = 0) => {
    const energy_kT = energy_j / 4.184e12; // 1 kt = 4.184e12 J
    const scaled_distance_r1 = r_obs_m / Math.pow(energy_kT, 1 / 3); // [C2005, Ec. 57]
    let overpressure_Pa;

    if (!isAirburst) {
      // Impacto en superficie (surface burst)  [C2005, Ec. 54]:
      //   p = (px·rx/4r1)·(1 + 3·(rx/r1)^1.3),  px=75000 Pa, rx=290 m
      const px = 75000;
      const rx = 290;
      overpressure_Pa =
        ((px * rx) / (4 * scaled_distance_r1)) *
        (1 + 3 * Math.pow(rx / scaled_distance_r1, 1.3));
    } else {
      // Airburst  [C2005, Ec. 55-58].
      const scaled_altitude_zb1 = burstAltitude_m / Math.pow(energy_kT, 1 / 3);
      // Borde interior de la región de Mach  [C2005, Ec. 58]:
      //   rm1 = 550·zb1 / (1.2·(550 - zb1))   (no hay región Mach si zb1 ≥ 550)
      if (scaled_altitude_zb1 >= 550) {
        // Sin región de Mach: decaimiento exponencial  [C2005, Ec. 55-56]
        const p0 = 3.14e11 * Math.pow(scaled_altitude_zb1, -2.6);
        const beta = 34.87 * Math.pow(scaled_altitude_zb1, -1.73);
        overpressure_Pa = p0 * Math.exp(-beta * scaled_distance_r1);
      } else {
        const rm1 =
          (550 * scaled_altitude_zb1) /
          (1.2 * (550 - scaled_altitude_zb1));
        if (scaled_distance_r1 > rm1) {
          // Región de Mach: Ec. 54 con rx aumentado  [C2005, p.830]
          const rx = 289 + 0.65 * scaled_altitude_zb1;
          const px = 75000;
          overpressure_Pa =
            ((px * rx) / (4 * scaled_distance_r1)) *
            (1 + 3 * Math.pow(rx / scaled_distance_r1, 1.3));
        } else {
          // Región de reflexión regular: decaimiento exponencial  [C2005, Ec. 55]
          const p0 = 3.14e11 * Math.pow(scaled_altitude_zb1, -2.6);
          const beta = 34.87 * Math.pow(scaled_altitude_zb1, -1.73);
          overpressure_Pa = p0 * Math.exp(-beta * scaled_distance_r1);
        }
      }
    }

    const p = overpressure_Pa;
    const P0 = CONST.ATM_PRESSURE;
    const c0 = CONST.SOUND_SPEED_AIR;
    // Velocidad máxima del viento  [C2005, Ec. 59]:
    //   u = (5p/7P0)·c0 / √(1 + 6p/7P0)
    const wind_velocity_ms =
      (((5 * p) / (7 * P0)) * c0) / Math.sqrt(1 + (6 * p) / (7 * P0));

    // Daños por sobrepresión  [C2005, Tabla 4] (datos de Glasstone & Dolan 1977).
    let damage = "Sin daños significativos.";
    if (p > 6900) damage = "Ventanas de vidrio se rompen.";
    if (p > 22900)
      damage =
        "Daño severo en techos y particiones interiores de casas de madera.";
    if (p > 26800)
      damage = "Colapso casi total de edificios con estructura de madera.";
    if (p > 38500)
      damage =
        "Edificios de mampostería de varios pisos: agrietamiento severo, particiones derribadas.";
    if (p > 42600)
      damage = "Colapso de edificios de mampostería de varios pisos.";
    if (p > 121000) damage = "Colapso de puentes de armadura (truss).";
    if (p > 273000)
      damage =
        "Edificios con estructura de acero: distorsión extrema del marco, colapso incipiente.";
    if (p > 426000)
      damage =
        "Vehículos desplazados y deformados; destrucción casi total.";

    return {
      overpressure_Pa: overpressure_Pa,
      windVelocity_ms: wind_velocity_ms,
      arrival_time_s: r_obs_m / c0, // [C2005, Ec. 64] (aprox. a c0)
      damageDescription: damage,
    };
  };

  // ---------------------------------------------------------------------------
  // RADIO DE EFECTO (búsqueda binaria de la distancia donde se cruza un umbral)
  // ---------------------------------------------------------------------------
  // Necesario porque la población afectada NO es solo la del cráter: la onda de
  // choque y el calor alcanzan mucho más lejos. Para cada efecto buscamos el
  // radio hasta donde el efecto es letalmente relevante y contamos población
  // dentro de ese radio con calculateImpactData.
  const findEffectRadius_m = (intensityAtDistance, threshold, maxRadius_m) => {
    // intensityAtDistance(r) debe ser decreciente en r.
    let lo = 1; // 1 m
    let hi = maxRadius_m;
    // Si ni al borde del cráter se supera el umbral, no hay radio.
    if (intensityAtDistance(lo) < threshold) return 0;
    // Si incluso al máximo se supera, devolvemos el máximo.
    if (intensityAtDistance(hi) >= threshold) return hi;
    for (let i = 0; i < 60; i++) {
      const mid = 0.5 * (lo + hi);
      if (intensityAtDistance(mid) >= threshold) lo = mid;
      else hi = mid;
    }
    return lo;
  };

  // ===========================================================================
  // LÓGICA PRINCIPAL
  // ===========================================================================
  const atm_result = calculateAtmosphericEntry();
  if (atm_result.error) return atm_result;

  // -------------------- ESCENARIO AIRBURST --------------------
  // (relevante en tu rango: cuerpos pequeños de 1 m a ~cientos de m pueden
  //  estallar en el aire; p.ej. Tunguska, Chelyabinsk). Ahora SÍ calculamos
  //  efectos térmico/sobrepresión y víctimas para el airburst.
  if (atm_result.isAirburst) {
    const E = atm_result.energy;
    const zb = atm_result.burstAltitude;

    const airBlast = calculateAirBlast(E, true, r_m, zb);
    const thermal = calculateThermalRadiation(E, r_m);

    // Población: para airburst no hay cráter. Usamos radios de efecto.
    // Umbral de sobrepresión letal de referencia: ~26.8 kPa (colapso de
    // vivienda de madera, [C2005] Tabla 4) — ajustable según criterio.
    const P_LETHAL = 26800;
    const blastIntensity = (rr) =>
      calculateAirBlast(E, true, rr, zb).overpressure_Pa;
    const maxR = Math.min(2.0e6, CONST.R_E); // tope de búsqueda 2000 km
    const blastRadius_m = findEffectRadius_m(blastIntensity, P_LETHAL, maxR);

    let thermalRadius_m = 0;
    if (thermal.applies) {
      // Umbral térmico de referencia: quemaduras de 3er grado (0.42 MJ/m²
      // escalado por E_Mt^(1/6), [C2005] Tabla 1 + Ec. 39).
      const E_Mt = E / 4.184e15;
      const phi3rd = 0.42e6 * Math.pow(E_Mt, 1 / 6);
      const thermalIntensity = (rr) => {
        const t = calculateThermalRadiation(E, rr);
        return t.applies ? t.thermalExposure_Jm2 : 0;
      };
      thermalRadius_m = findEffectRadius_m(thermalIntensity, phi3rd, maxR);
    }

    const popBlast = calculateImpactData(lat, lng, blastRadius_m, "POBTOT");
    const popThermal = calculateImpactData(lat, lng, thermalRadius_m, "POBTOT");
    const housingBlast = calculateImpactData(lat, lng, blastRadius_m, "TVIVHAB");

    const buildVictims = (population, vulnFn, intensity) => {
      const out = {};
      for (const sc of ["best", "expected", "worst"]) {
        const v = vulnFn(intensity, sc);
        out[sc] = { vulnerability: v, estimated: Math.round(population * v) };
      }
      return out;
    };

    // Víctima combinada no aditiva para airburst (solo choque + térmico;
    // un airburst no genera cráter, sismo significativo ni eyecta rocosa).
    const combinedRefPop = Math.max(popBlast, thermal.applies ? popThermal : 0);
    const combinedVictims = {};
    for (const sc of ["best", "expected", "worst"]) {
      const vList = [vulnerabilityOverpressure(airBlast.overpressure_Pa, sc)];
      if (thermal.applies)
        vList.push(vulnerabilityThermal(thermal.thermalExposure_Jm2, sc));
      const survive = vList.reduce((acc, v) => acc * (1 - v), 1);
      const pCombined = 1 - survive;
      combinedVictims[sc] = {
        vulnerability: pCombined,
        estimated: Math.round(combinedRefPop * pCombined),
      };
    }

    return {
      scenario: "Airburst",
      burstAltitude_km: zb / 1000,
      burstVelocity_kms: atm_result.burstVelocity / 1000,
      impactEnergyMegatons: E / 4.184e15,
      airBlast: airBlast,
      thermalRadiation: thermal,
      affectedData: {
        blastRadius_km: blastRadius_m / 1000,
        thermalRadius_km: thermalRadius_m / 1000,
        populationInBlast: popBlast,
        populationInThermal: popThermal,
        housingInBlast: housingBlast,
        combinedReferencePopulation: combinedRefPop,
      },
      victims: {
        shockwave: buildVictims(
          popBlast,
          vulnerabilityOverpressure,
          airBlast.overpressure_Pa
        ),
        fireball: thermal.applies
          ? buildVictims(
              popThermal,
              vulnerabilityThermal,
              thermal.thermalExposure_Jm2
            )
          : null,
      },
      combinedVictims: combinedVictims,
    };
  }

  // -------------------- ESCENARIO IMPACTO EN SUPERFICIE --------------------
  const v_final = atm_result.impactVelocity;
  // Energía de impacto  [C2005, Ec. 1]:  E = (π/12)·ρ·L0³·v²
  const energy_final =
    (CONST.PI / 12) * density_kgm3 * Math.pow(L0_m, 3) * Math.pow(v_final, 2);

  const target_density = CONST.RHO_T_CRYSTALLINE;
  const final_message = `Impacto en superficie a ${(v_final / 1000).toFixed(
    2
  )} km/s (objetivo: roca cristalina/volcánica, ρt=${target_density} kg/m³).`;

  // Efectos en la posición del observador
  const airBlast = calculateAirBlast(energy_final, false, r_m);
  const thermal = calculateThermalRadiation(energy_final, r_m);
  const crater = calculateCrater(density_kgm3, v_final, L0_m, target_density);
  const seismic = calculateSeismicEffects(energy_final, r_m);
  // Radio de bola de fuego para el límite de alcance de eyecta (E<200Mt).
  const fireballR_m =
    velocity_kms > 15 ? 0.002 * Math.pow(energy_final, 1 / 3) : 0;
  const ejecta = calculateEjecta(
    crater.transientDiameter_m,
    crater.finalDiameter_m,
    r_m,
    energy_final,
    fireballR_m
  );

  // ---- Población afectada POR CADA EFECTO (no solo por el cráter) ----
  const maxR = Math.min(2.0e6, CONST.R_E); // tope de búsqueda 2000 km

  // 1) Dentro del cráter: aniquilación total.
  const craterFinalRadius_m = crater.finalDiameter_m / 2;
  const popCrater = calculateImpactData(
    lat,
    lng,
    craterFinalRadius_m,
    "POBTOT"
  );
  const housingCrater = calculateImpactData(
    lat,
    lng,
    craterFinalRadius_m,
    "TVIVHAB"
  );

  // 2) Radio de onda de choque letal (umbral ref. 26.8 kPa, [C2005] Tabla 4).
  const P_LETHAL = 26800;
  const blastIntensity = (rr) =>
    calculateAirBlast(energy_final, false, rr).overpressure_Pa;
  const blastRadius_m = findEffectRadius_m(blastIntensity, P_LETHAL, maxR);
  const popBlast = calculateImpactData(lat, lng, blastRadius_m, "POBTOT");
  const housingBlast = calculateImpactData(lat, lng, blastRadius_m, "TVIVHAB");

  // 3) Radio térmico (umbral ref. quemaduras 3er grado, [C2005] Tabla 1 + Ec.39).
  let thermalRadius_m = 0;
  if (thermal.applies) {
    const E_Mt = energy_final / 4.184e15;
    const phi3rd = 0.42e6 * Math.pow(E_Mt, 1 / 6);
    const thermalIntensity = (rr) => {
      const t = calculateThermalRadiation(energy_final, rr);
      return t.applies ? t.thermalExposure_Jm2 : 0;
    };
    thermalRadius_m = findEffectRadius_m(thermalIntensity, phi3rd, maxR);
  }
  const popThermal = calculateImpactData(lat, lng, thermalRadius_m, "POBTOT");

  // 4) Radio SÍSMICO propio. El sismo es el efecto de mayor alcance [C2005].
  //    Umbral: Meff = 6.0 (Mercalli VI-VII, primer nivel con letalidad no
  //    despreciable según [R2017]). Por debajo de Meff~6 la vulnerabilidad
  //    sísmica de [R2017] es prácticamente cero. Ajustable.
  const M_SEISMIC_LETHAL = 6.0;
  const seismicIntensity = (rr) =>
    calculateSeismicEffects(energy_final, rr).effectiveMagnitude;
  // Meff puede ser negativo lejos; findEffectRadius_m asume función
  // decreciente, lo cual se cumple para Meff.
  const seismicRadius_m = findEffectRadius_m(
    seismicIntensity,
    M_SEISMIC_LETHAL,
    maxR
  );
  const popSeismic = calculateImpactData(lat, lng, seismicRadius_m, "POBTOT");

  // 5) Radio de EYECTA propio. Alcance corto; umbral de espesor letal.
  //    Referencia: te ≈ 0.2 m de manto -> carga que colapsa techos típicos
  //    (consistente con Fig.1d de [M2022], rango centimétrico-decimétrico).
  //    Además se respeta el límite físico de alcance (maxReach de la eyecta).
  const TE_LETHAL_m = 0.2;
  const ejectaThicknessAt = (rr) =>
    Math.pow(crater.transientDiameter_m, 4) / (112 * Math.pow(rr, 3));
  let ejectaRadius_m = findEffectRadius_m(
    ejectaThicknessAt,
    TE_LETHAL_m,
    maxR
  );
  // La eyecta no puede causar daño más allá de su alcance físico máximo.
  if (ejecta.maxReach_km) {
    ejectaRadius_m = Math.min(ejectaRadius_m, ejecta.maxReach_km * 1000);
  }
  const popEjecta = calculateImpactData(lat, lng, ejectaRadius_m, "POBTOT");

  // ---- Víctimas por efecto y por escenario (best/expected/worst) ----
  const buildVictims = (population, vulnFn, intensity) => {
    const out = {};
    for (const sc of ["best", "expected", "worst"]) {
      const v = vulnFn(intensity, sc);
      out[sc] = { vulnerability: v, estimated: Math.round(population * v) };
    }
    return out;
  };

  const victims = {
    // Cada efecto usa AHORA su propio radio y población expuesta:
    //   - choque -> popBlast (radio de sobrepresión letal)
    //   - térmico -> popThermal (radio de quemaduras 3er grado)
    //   - sismo  -> popSeismic (radio Meff≥6, mucho mayor que blast)
    //   - eyecta -> popEjecta (radio de espesor letal, menor que blast)
    shockwave: buildVictims(
      popBlast,
      vulnerabilityOverpressure,
      airBlast.overpressure_Pa
    ),
    fireball: thermal.applies
      ? buildVictims(
          popThermal,
          vulnerabilityThermal,
          thermal.thermalExposure_Jm2
        )
      : null,
    seismic: buildVictims(
      popSeismic,
      vulnerabilitySeismic,
      seismic.effectiveMagnitude
    ),
    ejecta:
      ejecta.insideCrater === false
        ? buildVictims(popEjecta, vulnerabilityEjecta, ejecta.thickness_m)
        : null,
  };

  // ---- VÍCTIMA COMBINADA (NO ADITIVA)  P = 1 - Π(1 - Vi) ----
  // [C2005] y [M2022] advierten que los efectos NO son aditivos: una persona
  // no muere varias veces. Para una estimación de total interpretable, se
  // toma como población expuesta la del MAYOR radio (envuelve a los demás) y
  // se combina la probabilidad de morir por AL MENOS un efecto.
  //
  // Aproximación y supuestos (documentados para que sean auditables):
  //   - Se asume independencia entre efectos (cota superior razonable).
  //   - La población de referencia es la del radio más amplio (normalmente el
  //     sísmico). Las vulnerabilidades de efectos de menor alcance aplican
  //     solo a quienes están dentro de su radio; fuera de él, su Vi=0. Para
  //     simplicidad y dado que el sismo domina el alcance, se evalúan todas
  //     las Vi a la intensidad del observador como aproximación de primer
  //     orden (consistente con el nivel de detalle de [M2022]).
  const combinedReferencePop = Math.max(
    popCrater,
    popBlast,
    thermal.applies ? popThermal : 0,
    popSeismic,
    ejecta.insideCrater === false ? popEjecta : 0
  );
  const combinedVictims = {};
  for (const sc of ["best", "expected", "worst"]) {
    const vList = [];
    vList.push(vulnerabilityOverpressure(airBlast.overpressure_Pa, sc));
    if (thermal.applies)
      vList.push(vulnerabilityThermal(thermal.thermalExposure_Jm2, sc));
    vList.push(vulnerabilitySeismic(seismic.effectiveMagnitude, sc));
    if (ejecta.insideCrater === false)
      vList.push(vulnerabilityEjecta(ejecta.thickness_m, sc));
    // P(morir por al menos uno) = 1 - Π(1 - Vi)
    const survive = vList.reduce((acc, v) => acc * (1 - v), 1);
    const pCombined = 1 - survive;
    combinedVictims[sc] = {
      vulnerability: pCombined,
      estimated: Math.round(combinedReferencePop * pCombined),
    };
  }

  return {
    scenario: "Impacto superficial",
    finalImpactMessage: final_message,
    impactVelocity_kms: v_final / 1000,
    impactEnergyMegatons: energy_final / 4.184e15,
    crater: crater,
    thermalRadiation: thermal,
    seismicEffects: seismic,
    ejecta: ejecta,
    airBlast: airBlast,
    affectedData: {
      craterRadius_km: craterFinalRadius_m / 1000,
      blastRadius_km: blastRadius_m / 1000,
      thermalRadius_km: thermalRadius_m / 1000,
      seismicRadius_km: seismicRadius_m / 1000,
      ejectaRadius_km: ejectaRadius_m / 1000,
      populationInCrater: popCrater,
      housingInCrater: housingCrater,
      populationInBlast: popBlast,
      housingInBlast: housingBlast,
      populationInThermal: popThermal,
      populationInSeismic: popSeismic,
      populationInEjecta: popEjecta,
      combinedReferencePopulation: combinedReferencePop,
    },
    victims: victims,
    combinedVictims: combinedVictims,
  };
};