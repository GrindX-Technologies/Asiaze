import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.vector8}>
      <div className={styles.vector6}>
        <div className={styles.group}>
          <img src="../image/moub1zwj-a2hty1y.png" className={styles.vector} />
        </div>
        <div className={styles.vector5}>
          <p className={styles.username}>Username</p>
          <div className={styles.group2}>
            <div className={styles.vector2}>
              <p className={styles.enterYourUsername}>Enter your username</p>
            </div>
          </div>
          <p className={styles.password}>Password</p>
          <div className={styles.group3}>
            <div className={styles.vector3}>
              <p className={styles.enterYourUsername}>Enter your password</p>
            </div>
          </div>
          <p className={styles.forgotPassword}>Forgot Password?</p>
          <div className={styles.vector4}>
            <p className={styles.login}>Login</p>
          </div>
        </div>
      </div>
      <div className={styles.vector7}>
        <p className={styles.termsOfService}>Terms of Service</p>
        <p className={styles.termsOfService}>Privacy Policy</p>
        <p className={styles.termsOfService}>Contact Us</p>
      </div>
    </div>
  );
}

export default Component;
