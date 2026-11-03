import Foundation
import HealthKit

/**
 * HealthKitManager
 * Connects with Apple HealthKit, requests permissions, and queries 30-day telemetry.
 */
public class HealthKitManager: ObservableObject {
    public static let shared = HealthKitManager()
    private let healthStore = HKHealthStore()

    @Published public var isHealthKitAvailable: Bool = false
    @Published public var isAuthorized: Bool = false

    private let isoFormatter = ISO8601DateFormatter()

    public init() {
        self.isHealthKitAvailable = HKHealthStore.isHealthDataAvailable()
    }

    /**
     * Set of HealthKit types requested for Fit Health
     */
    private func getReadTypes() -> Set<HKObjectType> {
        var types: Set<HKObjectType> = []

        if let steps = HKObjectType.quantityType(forIdentifier: .stepCount) { types.insert(steps) }
        if let hr = HKObjectType.quantityType(forIdentifier: .heartRate) { types.insert(hr) }
        if let rhr = HKObjectType.quantityType(forIdentifier: .restingHeartRate) { types.insert(rhr) }
        if let energy = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned) { types.insert(energy) }
        if let distance = HKObjectType.quantityType(forIdentifier: .distanceWalkingRunning) { types.insert(distance) }
        if let weight = HKObjectType.quantityType(forIdentifier: .bodyMass) { types.insert(weight) }
        if let bodyFat = HKObjectType.quantityType(forIdentifier: .bodyFatPercentage) { types.insert(bodyFat) }
        if let spo2 = HKObjectType.quantityType(forIdentifier: .oxygenSaturation) { types.insert(spo2) }
        if let vo2 = HKObjectType.quantityType(forIdentifier: .vo2Max) { types.insert(vo2) }
        if let sys = HKObjectType.quantityType(forIdentifier: .bloodPressureSystolic) { types.insert(sys) }
        if let dia = HKObjectType.quantityType(forIdentifier: .bloodPressureDiastolic) { types.insert(dia) }
        if let bp = HKObjectType.correlationType(forIdentifier: .bloodPressure) { types.insert(bp) }
        if let sleep = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) { types.insert(sleep) }
        types.insert(HKObjectType.workoutType())

        return types
    }

    public func requestAuthorization(completion: @escaping (Bool, Error?) -> Void) {
        guard isHealthKitAvailable else {
            completion(false, NSError(domain: "HealthKit", code: -1, userInfo: [NSLocalizedDescriptionKey: "HealthKit not supported on this device."]))
            return
        }

        let readTypes = getReadTypes()
        healthStore.requestAuthorization(toShare: nil, read: readTypes) { [weak self] success, error in
            DispatchQueue.main.async {
                self?.isAuthorized = success
                completion(success, error)
            }
        }
    }

    /**
     * Reads recent 30 days of Apple Health telemetry
     */
    public func fetchRecentTelemetry(completion: @escaping ([BiometricRecordDto]) -> Void) {
        let endDate = Date()
        let startDate = Calendar.current.date(byAdding: .day, value: -30, to: endDate) ?? endDate.addingTimeInterval(-30*86400)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)

        var collected: [BiometricRecordDto] = []
        let group = DispatchGroup()

        // 1. Steps
        if let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) {
            group.enter()
            let query = HKSampleQuery(sampleType: stepType, predicate: predicate, limit: 100, sortDescriptors: nil) { _, samples, _ in
                if let quantitySamples = samples as? [HKQuantitySample] {
                    for s in quantitySamples {
                        let count = s.quantity.doubleValue(for: HKUnit.count())
                        collected.append(BiometricRecordDto(
                            recordId: s.uuid.uuidString,
                            type: "steps",
                            value: AnyCodable(count),
                            unit: "steps",
                            startTime: self.isoFormatter.string(from: s.startDate),
                            endTime: self.isoFormatter.string(from: s.endDate)
                        ))
                    }
                }
                group.leave()
            }
            healthStore.execute(query)
        }

        // 2. Heart Rate
        if let hrType = HKQuantityType.quantityType(forIdentifier: .heartRate) {
            group.enter()
            let query = HKSampleQuery(sampleType: hrType, predicate: predicate, limit: 100, sortDescriptors: nil) { _, samples, _ in
                if let quantitySamples = samples as? [HKQuantitySample] {
                    let unit = HKUnit(from: "count/min")
                    for s in quantitySamples {
                        let bpm = s.quantity.doubleValue(for: unit)
                        collected.append(BiometricRecordDto(
                            recordId: s.uuid.uuidString,
                            type: "heart_rate",
                            value: AnyCodable(bpm),
                            unit: "bpm",
                            startTime: self.isoFormatter.string(from: s.startDate),
                            endTime: self.isoFormatter.string(from: s.endDate)
                        ))
                    }
                }
                group.leave()
            }
            healthStore.execute(query)
        }

        // 3. Resting Heart Rate
        if let rhrType = HKQuantityType.quantityType(forIdentifier: .restingHeartRate) {
            group.enter()
            let query = HKSampleQuery(sampleType: rhrType, predicate: predicate, limit: 30, sortDescriptors: nil) { _, samples, _ in
                if let quantitySamples = samples as? [HKQuantitySample] {
                    let unit = HKUnit(from: "count/min")
                    for s in quantitySamples {
                        let bpm = s.quantity.doubleValue(for: unit)
                        collected.append(BiometricRecordDto(
                            recordId: s.uuid.uuidString,
                            type: "resting_heart_rate",
                            value: AnyCodable(bpm),
                            unit: "bpm",
                            startTime: self.isoFormatter.string(from: s.startDate),
                            endTime: self.isoFormatter.string(from: s.endDate)
                        ))
                    }
                }
                group.leave()
            }
            healthStore.execute(query)
        }

        // 4. Weight
        if let weightType = HKQuantityType.quantityType(forIdentifier: .bodyMass) {
            group.enter()
            let query = HKSampleQuery(sampleType: weightType, predicate: predicate, limit: 30, sortDescriptors: nil) { _, samples, _ in
                if let quantitySamples = samples as? [HKQuantitySample] {
                    for s in quantitySamples {
                        let kg = s.quantity.doubleValue(for: HKUnit.gramUnit(with: .kilo))
                        collected.append(BiometricRecordDto(
                            recordId: s.uuid.uuidString,
                            type: "weight",
                            value: AnyCodable(round(kg * 100) / 100),
                            unit: "kg",
                            startTime: self.isoFormatter.string(from: s.startDate),
                            endTime: self.isoFormatter.string(from: s.endDate)
                        ))
                    }
                }
                group.leave()
            }
            healthStore.execute(query)
        }

        // 5. Oxygen Saturation
        if let spo2Type = HKQuantityType.quantityType(forIdentifier: .oxygenSaturation) {
            group.enter()
            let query = HKSampleQuery(sampleType: spo2Type, predicate: predicate, limit: 30, sortDescriptors: nil) { _, samples, _ in
                if let quantitySamples = samples as? [HKQuantitySample] {
                    for s in quantitySamples {
                        let pct = s.quantity.doubleValue(for: HKUnit.percent()) * 100
                        collected.append(BiometricRecordDto(
                            recordId: s.uuid.uuidString,
                            type: "oxygen_saturation",
                            value: AnyCodable(round(pct * 10) / 10),
                            unit: "%",
                            startTime: self.isoFormatter.string(from: s.startDate),
                            endTime: self.isoFormatter.string(from: s.endDate)
                        ))
                    }
                }
                group.leave()
            }
            healthStore.execute(query)
        }

        // 6. VO2 Max
        if let vo2Type = HKQuantityType.quantityType(forIdentifier: .vo2Max) {
            group.enter()
            let query = HKSampleQuery(sampleType: vo2Type, predicate: predicate, limit: 10, sortDescriptors: nil) { _, samples, _ in
                if let quantitySamples = samples as? [HKQuantitySample] {
                    let unit = HKUnit(from: "ml/kg*min")
                    for s in quantitySamples {
                        let val = s.quantity.doubleValue(for: unit)
                        collected.append(BiometricRecordDto(
                            recordId: s.uuid.uuidString,
                            type: "vo2_max",
                            value: AnyCodable(round(val * 10) / 10),
                            unit: "ml/kg/min",
                            startTime: self.isoFormatter.string(from: s.startDate),
                            endTime: self.isoFormatter.string(from: s.endDate)
                        ))
                    }
                }
                group.leave()
            }
            healthStore.execute(query)
        }

        group.notify(queue: .main) {
            completion(collected)
        }
    }
}

