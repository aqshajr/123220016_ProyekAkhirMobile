class TransactionResponse {
  final String status;
  final String? message;
  final Transaction? data;

  TransactionResponse({
    required this.status,
    this.message,
    this.data,
  });

  factory TransactionResponse.fromJson(Map<String, dynamic> json) {
    return TransactionResponse(
      status: json['status'] ?? 'error',
      message: json['message'], // bisa null
      data: json['data'] != null ? Transaction.fromJson(json['data']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'status': status,
      'message': message,
      'data': data?.toJson(),
    };
  }
}

class TransactionListResponse {
  final String status;
  final String? message;
  final List<Transaction> data;

  TransactionListResponse({
    required this.status,
    this.message,
    required this.data,
  });

  factory TransactionListResponse.fromJson(Map<String, dynamic> json) {
    return TransactionListResponse(
      status: json['status'] ?? 'error',
      message: json['message'],
      data: json['data'] != null
          ? List<Transaction>.from(
        json['data'].map((item) => Transaction.fromJson(item)),
      )
          : [],
    );
  }
}

class Transaction {
  final int id;
  final String validDate;
  final int ticketId;
  final int quantity;

  Transaction({
    required this.id,
    required this.validDate,
    required this.ticketId,
    required this.quantity,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'] ?? 0,
      validDate: json['validDate'] ?? '',
      ticketId: json['ticketId'] ?? 0,
      quantity: json['quantity'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'validDate': validDate,
      'ticketId': ticketId,
      'quantity': quantity,
    };
  }
}

class TransactionRequest {
  final String validDate;
  final int ticketId;
  final int quantity;

  TransactionRequest({
    required this.validDate,
    required this.ticketId,
    required this.quantity,
  });

  Map<String, dynamic> toJson() {
    return {
      'ticketID': ticketId,            // harus 'ticketID'
      'ticketQuantity': quantity,      // harus 'ticketQuantity'
      'validDate': validDate,
    };
  }
}
