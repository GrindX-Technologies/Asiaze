import 'dart:async';

class StoryEventBus {
  static final StreamController<Map<String, dynamic>> _controller = StreamController.broadcast();
  static Stream<Map<String, dynamic>> get stream => _controller.stream;

  static void broadcast(Map<String, dynamic> event) {
    _controller.add(event);
  }
}
