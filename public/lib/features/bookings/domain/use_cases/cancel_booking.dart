import '../repositories/booking_repository.dart';

class CancelBooking {
  final BookingRepository repository;

  CancelBooking(this.repository);

  Future<void> call(int bookingId) async {
    return await repository.cancelBooking(bookingId);
  }
}
