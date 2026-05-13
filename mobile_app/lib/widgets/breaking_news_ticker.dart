import 'dart:async';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../screens/home/article_detail_screen.dart';

class BreakingNewsTicker extends StatefulWidget {
  final List<dynamic> feedList;
  const BreakingNewsTicker({super.key, required this.feedList});

  @override
  State<BreakingNewsTicker> createState() => _BreakingNewsTickerState();
}

class _BreakingNewsTickerState extends State<BreakingNewsTicker> {
  List<dynamic> _breakingNews = [];
  bool _isLoading = true;
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _fetchBreakingNews();
    _pollTimer = Timer.periodic(const Duration(minutes: 2), (_) {
      _fetchBreakingNews(silent: true);
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchBreakingNews({bool silent = false}) async {
    if (!silent && mounted) {
      setState(() {
        _isLoading = true;
      });
    }
    try {
      final data = await ApiService.getNews(isBreaking: true);
      List<dynamic> mappedData = [];
      for (var item in data) {
        if (item['status'] == 'draft') continue;
        mappedData.add({
          'id': item['_id']?.toString() ?? '',
          'title': item['title'] ?? 'No Title',
          'excerpt': item['summary'] ?? item['content'] ?? 'No Description',
          'meta': '${item['createdAt'] != null ? DateTime.parse(item['createdAt']).toLocal().toString().split(' ')[0] : ''} | ${item['source'] ?? 'ASIAZE'}',
          'coverImage': item['coverImage'],
          'content': item['content'] ?? '',
          'categoryName': item['category'] is Map ? item['category']['name'] : '',
        });
      }
      if (mounted) {
        setState(() {
          _breakingNews = mappedData;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Failed to load breaking news: $e');
      if (mounted && !silent) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _openArticle(dynamic article) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ArticleDetailScreen(
          article: article,
          feedList: widget.feedList.isNotEmpty ? widget.feedList : _breakingNews,
          initialIndex: widget.feedList.isNotEmpty ? widget.feedList.indexWhere((a) => a['id'] == article['id']) : 0,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _breakingNews.isEmpty) {
      return _buildBar(context, child: const Text('Loading breaking news...', style: TextStyle(color: Colors.white)));
    }
    if (_breakingNews.isEmpty) {
      return const SizedBox.shrink();
    }

    if (_breakingNews.length == 1) {
      final article = _breakingNews.first;
      return InkWell(
        onTap: () => _openArticle(article),
        child: _buildBar(context, child: _buildLine(context, article['title'])),
      );
    }

    return _buildBar(
      context,
      child: CarouselSlider(
        options: CarouselOptions(
          viewportFraction: 1,
          height: 36,
          autoPlay: true,
          autoPlayInterval: const Duration(seconds: 4),
          autoPlayAnimationDuration: const Duration(milliseconds: 600),
          enableInfiniteScroll: true,
          scrollDirection: Axis.horizontal,
          scrollPhysics: const BouncingScrollPhysics(),
        ),
        items: _breakingNews.map((article) {
          return GestureDetector(
            onTap: () => _openArticle(article),
            child: Align(
              alignment: Alignment.centerLeft,
              child: _buildLine(context, article['title']),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildBar(BuildContext context, {required Widget child}) {
    return Container(
      height: 36,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      color: const Color(0xFFE0212B), // Changed background color as requested
      child: DefaultTextStyle.merge(
        style: GoogleFonts.lexendDeca(
          color: Colors.white,
          fontSize: 13,
          fontWeight: FontWeight.w400,
        ),
        child: Row(
          children: [
            Text(
              'Breaking News: ',
              style: GoogleFonts.lexendDeca(fontWeight: FontWeight.w700),
            ),
            Expanded(child: child),
          ],
        ),
      ),
    );
  }

  Widget _buildLine(BuildContext context, String title) {
    return Text(
      title,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
    );
  }
}
