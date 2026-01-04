import '../repositories/booking_repository.dart';
import '../../data/models/booking_model.dart';
import '../entities/booking_entity.dart';

class BookSession {
  final BookingRepository repository;

  BookSession(this.repository);

  Future<BookingEntity> call(int sessionId) async {
    return await repository.bookSession(sessionId);
  }
}
