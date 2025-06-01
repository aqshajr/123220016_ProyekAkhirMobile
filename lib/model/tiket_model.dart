import 'package:artefacto/model/temple_summary.dart';

class TicketRequest {
  int templeID;
  double price;
  String description;

  TicketRequest({
    required this.templeID,
    required this.price,
    required this.description,
  });

  Map<String, dynamic> toJson() {
    return {
      'templeID': templeID,
      'price': price,
      'description': description,
    };
  }
}

class TicketResponse {
  String? status;
  String? message;
  Ticket? ticket;
  TicketData? data;
  List<TicketError>? errors;

  TicketResponse({this.status, this.message, this.ticket, this.data, this.errors});

  TicketResponse.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    message = json['message'];

    if (json['data'] != null) {
      if (json['data']['ticket'] != null) {
        ticket = Ticket.fromJson(json['data']['ticket']);
      } else if (json['data']['tickets'] != null) {
        data = TicketData.fromJson(json['data']);
      }
    }

    if (json['errors'] != null) {
      errors = <TicketError>[];
      json['errors'].forEach((v) {
        errors!.add(TicketError.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> result = {};
    result['status'] = status;
    result['message'] = message;

    if (ticket != null) {
      result['data'] = {'ticket': ticket!.toJson()};
    } else if (data != null) {
      result['data'] = data!.toJson();
    }

    if (errors != null) {
      result['errors'] = errors!.map((e) => e.toJson()).toList();
    }

    return result;
  }
}

class TicketError {
  String? param;
  String? msg;

  TicketError({this.param, this.msg});

  TicketError.fromJson(Map<String, dynamic> json) {
    param = json['param'];
    msg = json['msg'];
  }

  Map<String, dynamic> toJson() {
    return {
      'param': param,
      'msg': msg,
    };
  }
}

class TicketData {
  List<Ticket>? tickets;

  TicketData({this.tickets});

  TicketData.fromJson(Map<String, dynamic> json) {
    if (json['tickets'] != null) {
      tickets = <Ticket>[];
      json['tickets'].forEach((v) {
        tickets!.add(Ticket.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> result = {};
    if (tickets != null) {
      result['tickets'] = tickets!.map((v) => v.toJson()).toList();
    }
    return result;
  }
}

class Ticket {
  int? ticketID;
  int? templeID;
  double? price;
  String? description;
  String? createdAt;
  String? updatedAt;
  TempleSummary? temple;

  Ticket({
    this.ticketID,
    this.templeID,
    this.price,
    this.description,
    this.createdAt,
    this.updatedAt,
    this.temple,
  });

  Ticket.fromJson(Map<String, dynamic> json) {
    ticketID = json['ticketID'];
    templeID = json['templeID'];

    // Perbaikan parsing price:
    if (json['price'] is String) {
      price = double.tryParse(json['price']);
    } else if (json['price'] is int) {
      price = (json['price'] as int).toDouble();
    } else if (json['price'] is double) {
      price = json['price'];
    } else {
      price = null;
    }

    description = json['description'];
    createdAt = json['created_at'];
    updatedAt = json['updated_at'];
    temple = json['Temple'] != null ? TempleSummary.fromJson(json['Temple']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    data['ticketID'] = ticketID;
    data['templeID'] = templeID;
    data['price'] = price;
    data['description'] = description;
    data['created_at'] = createdAt;
    data['updated_at'] = updatedAt;
    if (temple != null) {
      data['Temple'] = temple!.toJson();
    }
    return data;
  }
}
