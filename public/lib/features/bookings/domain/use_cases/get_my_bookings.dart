import '../repositories/booking_repository.dart';
import '../entities/booking_entity.dart';

class GetMyBookings {
  final BookingRepository repository;

  GetMyBookings(this.repository);

  Future<List<BookingEntity>> call() async {
    return await repository.getMyBookings();
  }
}
