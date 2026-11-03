import Foundation

public struct SyncRequestPayload: Codable {
    public let provider: String
    public let device: String
    public let records: [BiometricRecordDto]

    public init(provider: String = "apple-health", device: String = "Apple Watch / iPhone (HealthKit)", records: [BiometricRecordDto]) {
        self.provider = provider
        self.device = device
        self.records = records
    }
}

public struct SyncResponsePayload: Codable {
    public let success: Bool
    public let message: String?
    public let syncedCount: Int?
    public let lastSyncTimestamp: String?
}

public struct LoginResponsePayload: Codable {
    public let success: Bool
    public let message: String?
    public let token: String?
    public let user: UserPayload?
}

public struct UserPayload: Codable {
    public let id: String?
    public let name: String?
    public let email: String?
    public let role: String?
}

