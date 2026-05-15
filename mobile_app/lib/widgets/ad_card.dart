import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

class AdCard extends StatelessWidget {
  final dynamic ad;
  const AdCard({super.key, required this.ad});

  @override
  Widget build(BuildContext context) {
    final String mediaUrl = ad['mediaUrl'] ?? '';
    final url = mediaUrl.startsWith('http') ? mediaUrl : 'https://asiaze.cloud$mediaUrl';
    
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () async {
        if (ad['linkUrl'] != null && ad['linkUrl'].isNotEmpty) {
          String linkUrl = ad['linkUrl'];
          if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
            linkUrl = 'https://$linkUrl';
          }
          final uri = Uri.parse(linkUrl);
          try {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          } catch (e) {
            debugPrint('Could not launch $linkUrl: $e');
          }
        }
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFDC143C), width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(10),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: const BoxDecoration(
                color: Color(0xFFDC143C),
                borderRadius: BorderRadius.only(topLeft: Radius.circular(15), bottomRight: Radius.circular(15)),
              ),
              child: Text(
                'SPONSORED',
                style: GoogleFonts.lexendDeca(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ),
            if (mediaUrl.isNotEmpty)
              ClipRRect(
                borderRadius: const BorderRadius.only(topRight: Radius.circular(15), bottomLeft: Radius.circular(15), bottomRight: Radius.circular(15)),
                child: Image.network(url, width: double.infinity, fit: BoxFit.cover, errorBuilder: (c,e,s) => const SizedBox(height: 100)),
              ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(
                ad['title'] ?? 'Advertisement',
                style: GoogleFonts.lexendDeca(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
