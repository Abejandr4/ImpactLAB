// src/utils/Operaciones.js

/**
 * Simulador Completo de Impacto de Asteroides 🚀
 * Contiene toda la lógica de cálculo basada en el paper de Collins, Melosh, y Marcus (2005).
 * Esta función es "pura", lo que significa que no depende de React y solo se encarga de los cálculos.
 * La simulación está optimizada únicamente para impactos en TIERRA.
 * @param {object} params - Objeto con los parámetros de entrada para la simulación.
 * @returns {object} - Objeto con los resultados detallados de la simulación.
 */
export const simulateAsteroidImpact = ({
  diameter_km,
  density_kgm3,
  velocity_kms,
  angle_deg,
  distance_from_impact_km,
  lat, // <--- Nueva entrada
  lng, // <--- Nueva entrada
  geoJsonData, // <--- Los datos de población
  targetType = "land", // Solo se admite 'land'
}) => {
  // --- CONSTANTES GLOBALES Y FÍSICAS ---
  const CONST = {
    RHO_T_CRYSTALLINE: 2750.0, // Densidad del objetivo (Tierra)
    G_E: 9.8, // Aceleración de la gravedad (m/s²)
    H: 8000.0, // Altura de escala atmosférica (m)
    RHO_0: 1.0, // Densidad del aire en la superficie (kg/m³)
    C_D: 2.0, // Coeficiente de arrastre aerodinámico
    PI: Math.PI,
    R_E: 6.371e6, // Radio terrestre (m)
    STEFAN_BOLTZMANN: 5.67e-8, // Constante de Stefan-Boltzmann
    SOUND_SPEED_AIR: 330, // Velocidad del sonido en el aire (m/s)
    ATM_PRESSURE: 101325, // Presión atmosférica al nivel del mar (Pa)
    // ❌ ELIMINADO RHO_WATER
    // ❌ ELIMINADO C_D_WATER
  };

  // --- CONVERSIÓN DE UNIDADES A SI ---
  const L0_m = diameter_km * 1000.0; // Diámetro inicial (m)
  const v0_ms = velocity_kms * 1000.0; // Velocidad inicial (m/s)
  const theta_rad = (angle_deg * CONST.PI) / 180.0; // Ángulo (radianes)
  const r_m = distance_from_impact_km * 1000.0; // Distancia del observador (m)

  // --- MÓDULOS DE CÁLCULO (Funciones internas) ---

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

const calculateAffectedPopulation = (impactLat, impactLon, radiusMeters) => {
    if (!geoJsonData || !geoJsonData.features) return 0;
    let totalPop = 0;

    geoJsonData.features.forEach((feature) => {
      try {
        const coords =
          feature.geometry.type === "MultiPolygon"
            ? feature.geometry.coordinates[0][0][0]
            : feature.geometry.coordinates[0][0];

        const distance = getDistance(impactLat, impactLon, coords[1], coords[0]);
        if (distance <= radiusMeters) {
          totalPop += Number(feature.properties.POBTOT || 0);
        }
      } catch (e) { /* Geometría inválida */ }
    });
    return totalPop;
  };

  const calculateLethality = (intensity, population) => {

    if (!intensity || intensity <= 0) return { lethality: 0, estimatedVictims: 0 };

    // coeficientes ajustados para Puebla
    const a = 1.5; 
    const b = 9.0;

    const probability = 1 / (1 + Math.exp(-(a + b * Math.log10(intensity))));
    const clampedProb = Math.min(Math.max(probability, 0), 1);

    return {
      lethality: clampedProb,
      estimatedVictims: Math.round(population * clampedProb),
    };
  };

  const calculateAtmosphericEntry = () => {
    // Fórmulas para la fragmentación atmosférica y la velocidad de impacto en superficie.
    const log_Yi = 2.107 + 0.0624 * Math.sqrt(density_kgm3);
    const Yi = Math.pow(10, log_Yi);
    const term_ln_if_prime =
      ((4 * density_kgm3 * L0_m * Math.sin(theta_rad)) /
        (3 * CONST.C_D * CONST.H * Yi)) *
      CONST.RHO_0 *
      Math.pow(v0_ms, 2);

    if (term_ln_if_prime <= 0)
      return {
        error:
          "Non-physical parameters for fragmentation. Check diameter or density.",
      };

    const If_prime = Math.log(term_ln_if_prime);
    const numerator_If =
      1.308 - 0.314 * If_prime - 1.303 * Math.pow(If_prime, 2);
    const denominator_If = 1 + 0.217 * If_prime;
    const If = numerator_If / denominator_If;

    if (If > 1 || isNaN(If)) {
      // Impacto en superficie (no fragmentación o fragmentación mínima)
      const exponent =
        -(3 * CONST.RHO_0 * CONST.C_D * CONST.H) /
        (4 * density_kgm3 * L0_m * Math.sin(theta_rad));
      const v_impact = v0_ms * Math.exp(exponent);
      return { isAirburst: false, impactVelocity: v_impact };
    } else {
      // Fragmentación significativa (posible Airburst)
      const z_star = CONST.H * (If_prime - If);
      const rho_z_star = CONST.RHO_0 * Math.exp(-z_star / CONST.H);
      const l =
        L0_m *
        Math.sin(theta_rad) *
        Math.sqrt(density_kgm3 / (CONST.C_D * rho_z_star));
      const fp = 7.0;
      const term_sqrt_zb = Math.sqrt(Math.pow(fp, 2) - 1);
      const term_ln_zb = (l / (2 * CONST.H)) * term_sqrt_zb + 1;
      const zb = z_star - 2 * CONST.H * Math.log(term_ln_zb);

      const v_at_z_star =
        v0_ms *
        Math.exp(
          -(3 * rho_z_star * CONST.C_D * CONST.H) /
            (4 * density_kgm3 * L0_m * Math.sin(theta_rad))
        );
      if (zb > 0) {
        // Airburst (explosión en el aire)
        const energy =
          0.5 *
          ((CONST.PI / 6) * Math.pow(L0_m, 3) * density_kgm3) *
          Math.pow(v_at_z_star, 2);
        return { isAirburst: true, burstAltitude: zb, energy: energy };
      } else {
        // Impacto en superficie (después de fragmentación)
        const t1 = 34,
          t2 = Math.pow(l / CONST.H, 2) * Math.exp(z_star / CONST.H),
          t3 = 6 * Math.exp((2 * z_star) / CONST.H),
          t4 = -16 * Math.exp((3 * z_star) / (2 * CONST.H)),
          t5 = -3 * Math.pow(l / CONST.H, 2),
          t6 = -2;
        const integral =
          ((Math.pow(CONST.H, 3) * Math.pow(L0_m, 2)) / (3 * Math.pow(l, 2))) *
          (t1 + t2 + t3 + t4 + t5 + t6);
        const exponent_v =
          (-(3 * CONST.C_D * rho_z_star) /
            (4 * density_kgm3 * Math.pow(L0_m, 3) * Math.sin(theta_rad))) *
          integral;
        const v_impact = v_at_z_star * Math.exp(exponent_v);
        return { isAirburst: false, impactVelocity: v_impact };
      }
    }
  };

  const calculateCrater = (rho_i, v_i, L0, rho_t) => {
    // Cálculo del diámetro del cráter (transitorio y final)
    const factor_densidad = Math.pow(rho_i / rho_t, 1 / 3);
    const D_tc_m =
      1.161 *
      factor_densidad *
      Math.pow(L0, 0.78) *
      Math.pow(v_i, 0.44) *
      Math.pow(CONST.G_E, -0.22) *
      Math.pow(Math.sin(theta_rad), 1 / 3);
    const D_tc_km = D_tc_m / 1000;
    const Dc_km = 3.2; // Diámetro crítico para la transición Simple a Complex
    let D_fr_m = 0,
      type = "";
    if (D_tc_km < 2.56) {
      type = "Simple";
      D_fr_m = 1.25 * D_tc_m;
    } else {
      type = "Complex";
      const D_fr_km = (1.17 * Math.pow(D_tc_km, 1.13)) / Math.pow(Dc_km, 0.13);
      D_fr_m = D_fr_km * 1000;
    }
    return { transientDiameter_m: D_tc_m, finalDiameter_m: D_fr_m, type: type };
  };

  const calculateThermalRadiation = (energy_j) => {
    // Cálculo de la radiación térmica y efectos de ignición
    if (velocity_kms <= 15)
      return {
        message: "Insufficient speed for a significant fireball.",
      };

    const fireball_radius_m = 0.002 * Math.pow(energy_j, 1 / 3);
    const eta = 3.0e-3; // Eficiencia de radiación (ejemplo)
    const thermal_exposure_Jm2 =
      (eta * energy_j) / (2 * CONST.PI * Math.pow(r_m, 2));

    // Lógica de ignición y horizonte (simplified)
    const ignitionData = { Ropa: 1.0e6, Madera: 0.67e6, Césped: 0.38e6 };
    const energy_Mt = energy_j / 4.184e15;
    let ignition_effects = "";
    for (const material in ignitionData) {
      // Umbral simplificado de ignición
      const ignition_threshold =
        ignitionData[material] * Math.pow(energy_Mt, 1 / 6);
      if (thermal_exposure_Jm2 > ignition_threshold) {
        ignition_effects += `${material} catches fire. `;
      }
    }

    return {
      fireballRadius_km: fireball_radius_m / 1000,
      thermalExposure_Jm2: thermal_exposure_Jm2,
      ignitionEffects:
        ignition_effects || "Ignition of common materials is not expected.",
    };
  };

  const calculateSeismicEffects = (energy_j) => {
    // Cálculo de la magnitud Richter y la intensidad Mercalli
    const richter_magnitude = Math.max(0, 0.67 * Math.log10(energy_j) - 5.87);
    const r_km = r_m / 1000;

    // Decaimiento de la magnitud (M_eff) con la distancia
    let M_eff;
    if (r_km < 60) M_eff = richter_magnitude - 0.0238 * r_km;
    else if (r_km < 700) M_eff = richter_magnitude - 0.0048 * r_km - 1.1644;
    else M_eff = richter_magnitude - 1.66 * Math.log10(r_km) - 3.44;


    let mercalli = "I";
    if (M_eff > 2) mercalli = "II-III";
    if (M_eff > 4) mercalli = "IV-V";
    if (M_eff > 5) mercalli = "VI-VII (Daños menores)";
    if (M_eff > 6) mercalli = "VII-VIII (Daño moderado)";
    if (M_eff > 7) mercalli = "IX-X (Daño severo)";
    if (M_eff > 8) mercalli = "XI-XII (Destrucción / Colapso)";

    return {
      richterMagnitude: richter_magnitude,
      arrival_time_s: r_km / 5.0, // Asume 5 km/s de velocidad sísmica
      effectiveMagnitude: M_eff,
      mercalliIntensity: mercalli,
    };
  };

  const calculateEjecta = (crater_D_tc_m, crater_D_fr_m) => {
    // Cálculo de la capa de eyección (thickness) y el tamaño de fragmento
    const thickness_m = Math.pow(crater_D_tc_m, 4) / (112 * Math.pow(r_m, 3));
    const r_km = r_m / 1000;
    const D_fr_km = crater_D_fr_m / 1000;
    if (r_km < D_fr_km / 2)
      return { message: "Location within the final crater." };

    const dc = 2400 * Math.pow(D_fr_km / 2, -1.62);
    const alpha = 2.65;
    const fragment_size_m = dc * Math.pow(D_fr_km / (2 * r_km), alpha);

    return {
      thickness_m: thickness_m,
      meanFragmentSize_mm: fragment_size_m * 1000,
    };
  };

  const calculateAirBlast = (energy_j, isAirburst, burstAltitude_m = 0) => {
    // Cálculo de la sobrepresión y la velocidad del viento
    const energy_kT = energy_j / 4.184e12;
    const scaled_distance_r1 = r_m / Math.pow(energy_kT, 1 / 3);
    let overpressure_Pa;

    // Lógica de la onda de choque (diferente para impacto y airburst)
    if (!isAirburst) {
      const px = 75000,
        rx = 290;
      overpressure_Pa =
        ((px * rx) / (4 * scaled_distance_r1)) *
        (1 + 3 * Math.pow(rx / scaled_distance_r1, 1.3));
    } else {
      // Lógica Airburst (mantenida por si el cálculo atmosférico lo requiere)
      const scaled_altitude_zb1 = burstAltitude_m / Math.pow(energy_kT, 1 / 3);
      if (scaled_altitude_zb1 >= 550) {
        const p0 = 3.14e11 * Math.pow(scaled_altitude_zb1, -2.6);
        const beta = 34.87 * Math.pow(scaled_altitude_zb1, -1.73);
        overpressure_Pa = p0 * Math.exp(-beta * scaled_distance_r1);
      } else {
        const rm1 =
          (550 * scaled_altitude_zb1) / (1.2 * (550 - scaled_altitude_zb1));
        if (scaled_distance_r1 > rm1) {
          const rx = 289 + 0.65 * scaled_altitude_zb1;
          const px = 75000;
          overpressure_Pa =
            ((px * rx) / (4 * scaled_distance_r1)) *
            (1 + 3 * Math.pow(rx / scaled_distance_r1, 1.3));
        } else {
          const p0 = 3.14e11 * Math.pow(scaled_altitude_zb1, -2.6);
          const beta = 34.87 * Math.pow(scaled_altitude_zb1, -1.73);
          overpressure_Pa = p0 * Math.exp(-beta * scaled_distance_r1);
        }
      }
    }

    const p = overpressure_Pa;
    const P0 = CONST.ATM_PRESSURE;
    const c0 = CONST.SOUND_SPEED_AIR;
    const wind_velocity_ms =
      (((5 * p) / (7 * P0)) * c0) / Math.sqrt(1 + (6 * p) / (7 * P0));

    // Descripción de daños basada en sobrepresión (Pa)
    let damage = "No significant damage.";
    if (p > 6900) damage = "Broken glass windows.";
    if (p > 22900)
      damage = "Severe damage to roofs and interior walls of wooden houses.";
    if (p > 26800) damage = "Almost total collapse of wooden-framed buildings.";
    if (p > 42600) damage = "Collapse of masonry buildings.";
    if (p > 121000) damage = "Collapse of truss bridges.";
    if (p > 273000)
      damage = "Steel-framed office buildings suffer extreme distortion.";

    return {
      overpressure_Pa: overpressure_Pa,
      arrival_time_s: r_m / c0,
      wind_velocity_ms: wind_velocity_ms,
      damageDescription: damage,
    };
  };

  // --- LÓGICA PRINCIPAL DE LA SIMULACIÓN ---
  const atm_result = calculateAtmosphericEntry();
  if (atm_result.error) return atm_result;

  if (atm_result.isAirburst) {
    // Escenario Airburst
    return {
      scenario: "Airburst",
      burstAltitude_km: atm_result.burstAltitude / 1000,
      impactEnergyMegatons: atm_result.energy / 4.184e15,
      airBlast: calculateAirBlast(
        atm_result.energy,
        true,
        atm_result.burstAltitude
      ),
    };
  }

  // Si no es Airburst, se calcula el impacto en superficie
  let v_final = atm_result.impactVelocity;
  let energy_final =
    (CONST.PI / 12) * density_kgm3 * Math.pow(L0_m, 3) * Math.pow(v_final, 2);

  let target_density = CONST.RHO_T_CRYSTALLINE;
  let final_message = `Impact on land at a speed of ${(v_final / 1000).toFixed(
    2
  )} km/s.`;
  const airBlast = calculateAirBlast(energy_final, false);
  const thermal = calculateThermalRadiation(energy_final);
  const crater = calculateCrater(density_kgm3, v_final, L0_m, target_density);
  const seismic = calculateSeismicEffects(energy_final);
  const ejecta = calculateEjecta(
    crater.transientDiameter_m,
    crater.finalDiameter_m
  )

  const craterFinalRadius = crater.finalDiameter_m / 2
  const population = calculateAffectedPopulation(lat, lng, craterFinalRadius);

  const fireballStats = calculateLethality(thermal, population);
  const shockwaveStats = calculateLethality(airBlast, population);

  // Devolver todos los resultados
  return {
    scenario: "Surface Impact",
    finalImpactMessage: final_message,
    impactEnergyMegatons: energy_final / 4.184e15,
    crater: crater,
    thermalRadiation: thermal,
    seismicEffects: seismic,
    ejecta: ejecta,
    airBlast: airBlast,
    populationAffected: population,
    lethalityFireball: fireballStats.probability,
    victimsFireball: fireballStats.victims,
    lethalityShockwave: shockwaveStats.probability,
    victimsShockwave: shockwaveStats.victims,
  };
};
