import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../widgets/regular_news_card.dart';

class SavedArticlesScreen extends StatelessWidget {
  const SavedArticlesScreen({super.key});

  final List<Map<String, dynamic>> _savedData = const [
    {
      'id': '1',
      'title': 'Breaking News: Major Event Unfolds',
      'excerpt': 'This is a preview of the article content, providing a glimpse into the full story. Stay tuned for more details...',
      'meta': '',
    },
    {
      'id': '2',
      'title': 'In-Depth Analysis: Economic Trends',
      'excerpt': 'Explore the latest insights and trends in the economic sector. This article dives deep into...',
      'meta': '',
    },
    {
      'id': '3',
      'title': 'Lifestyle: Tips for a Healthier Living',
      'excerpt': 'Discover simple yet effective strategies to enhance your lifestyle and well-being in this comprehensive guide...',
      'meta': '',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Saved Articles',
          style: GoogleFonts.lexendDeca(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: Colors.black,
          ),
        ),
        centerTitle: true,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: Color(0xFFE2E8F0)),
        ),
      ),
      body: _savedData.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.only(top: 8, bottom: 24),
              itemCount: _savedData.length,
              itemBuilder: (context, index) {
                return RegularNewsCard(
                  article: _savedData[index],
                  onTap: () {
                    // Navigate to detail
                  },
                );
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Color(0xFFFFF0F2),
            ),
            child: const Icon(Icons.menu_book, size: 64, color: Color(0xFFDC143C)),
          ),
          const SizedBox(height: 24),
          Text(
            'No saved articles yet',
            style: GoogleFonts.roboto(
              fontSize: 16,
              color: const Color(0xFF6B7280),
            ),
          ),
        ],
      ),
    );
  }
}
