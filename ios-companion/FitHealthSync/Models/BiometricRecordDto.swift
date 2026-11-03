import Foundation

/**
 * BiometricRecordDto
 * JSON representation conforming to Fit Health backend schema: POST /api/biometrics/sync
 */
public struct BiometricRecordDto: Codable {
    public let recordId: String
    public let type: String
    public let value: AnyCodable
    public let unit: String
    public let startTime: String
    public let endTime: String
    public let provider: String
    public let sourceApp: String

    public init(
        recordId: String,
        type: String,
        value: AnyCodable,
        unit: String,
        startTime: String,
        endTime: String,
        provider: String = "apple-health",
        sourceApp: String = "Apple Health (HealthKit)"
    ) {
        self.recordId = recordId
        self.type = type
        self.value = value
        self.unit = unit
        self.startTime = startTime
        self.endTime = endTime
        self.provider = provider
        self.sourceApp = sourceApp
    }
}

/**
 * Type-erased Codable wrapper for polymorphic values (Double, Int, String, Dictionary)
 */
public struct AnyCodable: Codable {
    public let value: Any

    public init(_ value: Any) {
        self.value = value
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let d = try? container.decode(Double.self) {
            self.value = d
        } else if let s = try? container.decode(String.self) {
            self.value = s
        } else if let dict = try? container.decode([String: Double].self) {
            self.value = dict
        } else {
            self.value = ""
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        if let d = value as? Double {
            try container.encode(d)
        } else if let i = value as? Int {
            try container.encode(i)
        } else if let s = value as? String {
            try container.encode(s)
        } else if let dict = value as? [String: Int] {
            try container.encode(dict)
        } else if let dict = value as? [String: Double] {
            try container.encode(dict)
        }
    }
}

