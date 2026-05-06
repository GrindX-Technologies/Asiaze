import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class NewsCard extends StatelessWidget {
  final Map<String, dynamic> article;
  final VoidCallback onTap;

  const NewsCard({
    super.key,
    required this.article,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Determine screen dimensions to make card fill most of the screen
    final size = MediaQuery.of(context).size;
    // We leave some space for the top nav and bottom nav
    final cardHeight = size.height * 0.7;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: cardHeight,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(12),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Image
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                  child: Container(
                    height: cardHeight * 0.45,
                    width: double.infinity,
                    color: Colors.grey[300],
                    child: article['coverImage'] != null && article['coverImage'].isNotEmpty
                        ? Image.network(
                            'https://asiaze.cloud${article['coverImage']}',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                const Icon(Icons.image, size: 64, color: Colors.grey),
                          )
                        : const Icon(Icons.image, size: 64, color: Colors.grey),
                  ),
                ),
                // FABs (Bookmark & Share)
                Positioned(
                  bottom: 0,
                  right: 16,
                  child: Transform.translate(
                    offset: const Offset(0, 16),
                    child: Row(
                      children: [
                        _buildFab(Icons.bookmark),
                        const SizedBox(width: 8),
                        _buildFab(Icons.share),
                      ],
                    ),
                  ),
                )
              ],
            ),
            const SizedBox(height: 24), // Space for floating FABs
            // Article Content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      article['title'] ?? '',
                      style: GoogleFonts.roboto(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: Colors.black,
                        height: 1.3,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 12),
                    Expanded(
                      child: Text(
                        article['excerpt'] ?? '',
                        style: GoogleFonts.roboto(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: const Color(0xFF64748B), // Gray
                          height: 1.5,
                        ),
                        maxLines: 5,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      article['meta'] ?? 'Few hours ago | ASIAZE',
                      style: GoogleFonts.roboto(
                        fontSize: 10,
                        color: const Color(0xFF94A3B8), // Light gray
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFab(IconData icon) {
    return Container(
      width: 36,
      height: 36,
      decoration: const BoxDecoration(
        color: Color(0xFFDC143C),
        shape: BoxShape.circle,
      ),
      child: Icon(
        icon,
        color: Colors.white,
        size: 18,
      ),
    );
  }
}
