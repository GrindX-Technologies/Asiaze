import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../widgets/regular_news_card.dart';
import '../home/article_detail_screen.dart';

class CategoryDetailScreen extends StatefulWidget {
  final String categoryName;

  const CategoryDetailScreen({super.key, required this.categoryName});

  @override
  State<CategoryDetailScreen> createState() => _CategoryDetailScreenState();
}

class _CategoryDetailScreenState extends State<CategoryDetailScreen> {
  // Dummy Data for the category
  final List<Map<String, dynamic>> _categoryData = [
    {
      'id': '1',
      'title': 'Thrilling Soccer Match Concludes with Dramatic Finale',
      'excerpt': 'A match that kept fans on the edge of their seats...',
      'meta': 'ESPN • 2 hours ago',
    },
    {
      'id': '2',
      'title': 'Formula 1: A Race to Remember in Monaco',
      'excerpt': 'The streets of Monaco witnessed a spectacular race...',
      'meta': 'BBC Sport • 3 hours ago',
    },
    {
      'id': '3',
      'title': 'Grand Slam Victory: Tennis Prodigy Shines Bright',
      'excerpt': 'Young talent takes the world by storm with a stunning victory...',
      'meta': 'Reuters • 5 hours ago',
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
          widget.categoryName,
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
      body: ListView.builder(
        padding: const EdgeInsets.only(top: 8, bottom: 24),
        itemCount: _categoryData.length,
        itemBuilder: (context, index) {
          return RegularNewsCard(
            article: _categoryData[index],
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ArticleDetailScreen(article: _categoryData[index]),
                ),
              );
            },
          );
        },
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: BottomNavigationBar(
        currentIndex: 0, // Search/Explore is active
        onTap: (index) {
          if (index == 1) {
            // Navigate back to Home
            Navigator.popUntil(context, (route) => route.isFirst);
          }
          // Handle other tabs if needed
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        showSelectedLabels: false,
        showUnselectedLabels: false,
        selectedItemColor: const Color(0xFFDC143C),
        unselectedItemColor: const Color(0xFF64748B),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.search, size: 28),
            label: 'Search',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.home, size: 28),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline, size: 28),
            label: 'Profile',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_outline, size: 28),
            label: 'Chat',
          ),
        ],
      ),
    );
  }
}
