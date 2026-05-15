import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/services.dart';
import '../../services/api_service.dart';

class RewardsScreen extends StatefulWidget {
  const RewardsScreen({super.key});

  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  int _currentPoints = 0;
  String _referralCode = '';
  List<dynamic> _availableRewards = [];
  bool _isLoading = true;
  final Set<String> _redeemedCoupons = {};

  @override
  void initState() {
    super.initState();
    _fetchRewardsAndCoupons();
  }

  Future<void> _fetchRewardsAndCoupons() async {
    try {
      final rewardsData = await ApiService.getRewards();
      final couponsData = await ApiService.getActiveCoupons();
      setState(() {
        _currentPoints = rewardsData['points'] ?? 0;
        _referralCode = rewardsData['referralId'] ?? '';
        _availableRewards = couponsData;
        
        if (rewardsData['redeemedCoupons'] != null) {
          _redeemedCoupons.clear();
          for (var id in rewardsData['redeemedCoupons']) {
            _redeemedCoupons.add(id.toString());
          }
        }
        
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading data: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Reward Points',
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
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFDC143C)))
          : Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Points Summary Card
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 20.0),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withAlpha(15),
                                blurRadius: 6,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              Container(
                                width: 64,
                                height: 64,
                                decoration: const BoxDecoration(
                                  color: Color(0xFFDC143C),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.card_giftcard, color: Colors.white, size: 32),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                '$_currentPoints Points',
                                style: GoogleFonts.roboto(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFFDC143C),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Share your referral code to earn more\npoints.',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.roboto(
                                  fontSize: 14,
                                  color: const Color(0xFF4B5563),
                                  height: 1.4,
                                ),
                              ),
                              const SizedBox(height: 16),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF3F4F6),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Your Referral Code',
                                          style: GoogleFonts.roboto(
                                            fontSize: 12,
                                            color: const Color(0xFF6B7280),
                                          ),
                                        ),
                                        Text(
                                          _referralCode,
                                          style: GoogleFonts.roboto(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.black,
                                          ),
                                        ),
                                      ],
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.copy, color: Color(0xFFDC143C)),
                                      onPressed: () {
                                        Clipboard.setData(ClipboardData(text: _referralCode));
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(content: Text('Referral code copied!')),
                                        );
                                      },
                                    )
                                  ],
                                ),
                              )
                            ],
                          ),
                        ),
                        const SizedBox(height: 32),

                        // Available Rewards Section
                  Text(
                    'Available Rewards',
                    style: GoogleFonts.roboto(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Rewards List
                  if (_availableRewards.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      child: Center(
                        child: Text(
                          'No rewards available at the moment.',
                          style: GoogleFonts.roboto(color: Colors.grey),
                        ),
                      ),
                    )
                  else
                    ..._availableRewards.map((reward) {
                      final requiredPts = reward['requiredPoints'] as int? ?? 0;
                      final canRedeem = _currentPoints >= requiredPts;
                      final imageUrl = reward['imageUrl'] ?? 'https://via.placeholder.com/150';
                      
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withAlpha(10),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            // Thumbnail Image Placeholder
                            Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF3F4F6),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Image.network(
                                  imageUrl.startsWith('http') ? imageUrl : 'https://asiaze.cloud$imageUrl',
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) {
                                    return const Icon(Icons.image, color: Colors.grey);
                                  },
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            
                            // Reward Details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    reward['title'] ?? 'Reward',
                                    style: GoogleFonts.roboto(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.black,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '$requiredPts pts',
                                    style: GoogleFonts.roboto(
                                      fontSize: 14,
                                      color: const Color(0xFF6B7280),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            
                              // Redeem / Code Button
                              _redeemedCoupons.contains(reward['_id']) 
                                ? GestureDetector(
                                    onTap: () {
                                      showDialog(
                                        context: context,
                                        builder: (context) => AlertDialog(
                                          title: Text('Your Coupon Code', style: GoogleFonts.lexendDeca(fontWeight: FontWeight.bold)),
                                          content: Column(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Text('Use the following code to claim your reward:', style: GoogleFonts.roboto()),
                                              const SizedBox(height: 16),
                                              Container(
                                                padding: const EdgeInsets.all(16),
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFFF3F4F6),
                                                  borderRadius: BorderRadius.circular(8),
                                                  border: Border.all(color: const Color(0xFFDC143C).withAlpha(50)),
                                                ),
                                                child: Text(
                                                  reward['code'] ?? 'CODE-UNAVAILABLE',
                                                  style: GoogleFonts.robotoMono(
                                                    fontSize: 20,
                                                    fontWeight: FontWeight.bold,
                                                    color: Colors.black,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                          actions: [
                                            TextButton(
                                              onPressed: () => Navigator.pop(context),
                                              child: const Text('Close', style: TextStyle(color: Colors.grey)),
                                            ),
                                            ElevatedButton.icon(
                                              onPressed: () {
                                                Clipboard.setData(ClipboardData(text: reward['code'] ?? ''));
                                                ScaffoldMessenger.of(context).showSnackBar(
                                                  const SnackBar(content: Text('Coupon code copied to clipboard!')),
                                                );
                                                Navigator.pop(context);
                                              },
                                              icon: const Icon(Icons.copy, size: 16),
                                              label: const Text('Copy Code'),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: const Color(0xFFDC143C),
                                                foregroundColor: Colors.white,
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFDC143C).withAlpha(20),
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(color: const Color(0xFFDC143C)),
                                      ),
                                      child: Text(
                                        'REDEEM THE OFFER NOW',
                                        style: GoogleFonts.roboto(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w800,
                                          color: const Color(0xFFDC143C),
                                        ),
                                      ),
                                    ),
                                  )
                                : ElevatedButton(
                                    onPressed: canRedeem ? () {
                                      // Show redemption dialog or handle redemption
                                      showDialog(
                                        context: context,
                                        builder: (context) => AlertDialog(
                                          title: const Text('Redeem Reward'),
                                          content: Text('Are you sure you want to redeem this reward for $requiredPts points?'),
                                          actions: [
                                            TextButton(
                                              onPressed: () => Navigator.pop(context),
                                              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
                                            ),
                                            TextButton(
                                              onPressed: () async {
                                                final navigator = Navigator.of(context);
                                                final scaffoldMessenger = ScaffoldMessenger.of(context);
                                                try {
                                                  // API call for processing redemption
                                                  final response = await ApiService.redeemCoupon(reward['_id']);
                                                  if (mounted) {
                                                    setState(() {
                                                      _currentPoints = response['points'] ?? (_currentPoints - requiredPts);
                                                      _redeemedCoupons.add(reward['_id']);
                                                    });
                                                    navigator.pop();
                                                    scaffoldMessenger.showSnackBar(
                                                      const SnackBar(content: Text('Redemption successful!')),
                                                    );
                                                  }
                                                } catch (e) {
                                                  if (mounted) {
                                                    navigator.pop();
                                                    scaffoldMessenger.showSnackBar(
                                                      SnackBar(content: Text('Error: ${e.toString().replaceAll('Exception: ', '')}')),
                                                    );
                                                  }
                                                }
                                              },
                                              child: const Text('Redeem', style: TextStyle(color: Color(0xFFDC143C))),
                                            ),
                                          ],
                                        ),
                                      );
                                    } : null,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: canRedeem 
                                          ? const Color(0xFFDC143C) 
                                          : const Color(0xFFE5B0B8), // Muted red if disabled
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      elevation: 0,
                                    ),
                                    child: Text(
                                      'Redeem',
                                      style: GoogleFonts.roboto(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),
          ),
          
          // Footer Note
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(10),
                  blurRadius: 6,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Text(
              'Points are verified through your share/referral activity.',
              textAlign: TextAlign.center,
              style: GoogleFonts.roboto(
                fontSize: 12,
                color: const Color(0xFF9CA3AF),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
