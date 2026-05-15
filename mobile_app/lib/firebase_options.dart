import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError(
        'DefaultFirebaseOptions have not been configured for web - '
        'you can reconfigure this by running the FlutterFire CLI again.',
      );
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDLa0d59hDcLrj7IKy7I9NYrc_Yp7YgcGs',
    appId: '1:1085625342541:android:c0193aff44da342eea5a04',
    messagingSenderId: '1085625342541',
    projectId: 'asiaze2026',
    storageBucket: 'asiaze2026.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyDahjhQH9M1XFfr4fQCnEzCsIis3lipbaE',
    appId: '1:1085625342541:ios:cf96d2d171a0bd82ea5a04',
    messagingSenderId: '1085625342541',
    projectId: 'asiaze2026',
    storageBucket: 'asiaze2026.firebasestorage.app',
    iosClientId: '1085625342541-pp0033esqv2h9pcir8s29il7njd8jain.apps.googleusercontent.com',
    iosBundleId: 'com.asiaze.mobile',
  );
}
