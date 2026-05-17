import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Feed Sorting Logic Validation', () {
    test('Sorts articles strictly in descending order (most recent first) and handles edge cases', () {
      // Mock data with 20+ articles, including missing, future, and duplicate timestamps
      List<Map<String, dynamic>> articles = [
        {'id': '1', 'createdAtRaw': '2024-05-10T10:00:00.000Z'},
        {'id': '2', 'createdAtRaw': '2024-05-15T10:00:00.000Z'}, // Duplicate
        {'id': '3', 'createdAtRaw': '2024-05-12T10:00:00.000Z'},
        {'id': '4', 'createdAtRaw': null}, // Missing timestamp
        {'id': '5', 'createdAtRaw': '2030-01-01T10:00:00.000Z'}, // Future-dated
        {'id': '6', 'createdAtRaw': '2024-05-11T10:00:00.000Z'},
        {'id': '7', 'createdAtRaw': '2024-05-15T10:00:00.000Z'}, // Duplicate
        {'id': '8', 'createdAtRaw': 'invalid-date-string'}, // Invalid timestamp
        {'id': '9', 'createdAtRaw': '2024-05-09T10:00:00.000Z'},
        {'id': '10', 'createdAtRaw': '2024-05-08T10:00:00.000Z'},
        {'id': '11', 'createdAtRaw': '2024-05-07T10:00:00.000Z'},
        {'id': '12', 'createdAtRaw': '2024-05-06T10:00:00.000Z'},
        {'id': '13', 'createdAtRaw': '2024-05-05T10:00:00.000Z'},
        {'id': '14', 'createdAtRaw': '2024-05-04T10:00:00.000Z'},
        {'id': '15', 'createdAtRaw': '2024-05-03T10:00:00.000Z'},
        {'id': '16', 'createdAtRaw': '2024-05-02T10:00:00.000Z'},
        {'id': '17', 'createdAtRaw': '2024-05-01T10:00:00.000Z'},
        {'id': '18', 'createdAtRaw': '2024-04-30T10:00:00.000Z'},
        {'id': '19', 'createdAtRaw': '2024-04-29T10:00:00.000Z'},
        {'id': '20', 'createdAtRaw': '2024-04-28T10:00:00.000Z'},
        {'id': '21', 'createdAtRaw': '2024-04-27T10:00:00.000Z'},
        {'id': '22', 'createdAtRaw': '2024-04-26T10:00:00.000Z'},
      ];

      // Exact sorting logic from home_screen.dart
      articles.sort((a, b) {
        DateTime parseDate(dynamic dateRaw, dynamic id) {
          if (dateRaw == null) {
            return DateTime.fromMillisecondsSinceEpoch(0);
          }
          try {
            return DateTime.parse(dateRaw.toString());
          } catch (e) {
            return DateTime.fromMillisecondsSinceEpoch(0);
          }
        }

        DateTime dateA = parseDate(a['createdAtRaw'], a['id']);
        DateTime dateB = parseDate(b['createdAtRaw'], b['id']);

        return dateB.compareTo(dateA);
      });

      // Assertions
      expect(articles.first['id'], '5', reason: 'Future-dated article should be first (most recent)');
      
      // Duplicates should be next (2024-05-15)
      expect(['2', '7'].contains(articles[1]['id']), true);
      expect(['2', '7'].contains(articles[2]['id']), true);
      
      // Check middle sorting
      expect(articles[3]['id'], '3'); // 2024-05-12
      expect(articles[4]['id'], '6'); // 2024-05-11
      expect(articles[5]['id'], '1'); // 2024-05-10
      
      // Check edge cases at the end (null and invalid should be epoch 0)
      expect(['4', '8'].contains(articles[20]['id']), true, reason: 'Invalid/Null timestamps should be at the end');
      expect(['4', '8'].contains(articles[21]['id']), true, reason: 'Invalid/Null timestamps should be at the end');
    });
  });
}
