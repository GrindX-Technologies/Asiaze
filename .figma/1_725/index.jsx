import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.vector6}>
      <div className={styles.group}>
        <img src="../image/mou82bp2-m6bztcw.png" className={styles.vector} />
      </div>
      <div className={styles.group2}>
        <div className={styles.vector2}>
          <p className={styles.emailOrPhone}>Email or Phone</p>
        </div>
      </div>
      <div className={styles.group3}>
        <div className={styles.vector3}>
          <p className={styles.emailOrPhone}>Password</p>
        </div>
      </div>
      <div className={styles.vector4}>
        <p className={styles.login}>Login</p>
      </div>
      <p className={styles.orContinueWith}>Or continue with</p>
      <div className={styles.group4}>
        <div className={styles.vector5}>
          <img src="../image/mou82bp1-c4xr29e.svg" className={styles.frame} />
          <p className={styles.google}>Google</p>
        </div>
      </div>
      <div className={styles.autoWrapper}>
        <p className={styles.donTHaveAnAccount}>Don’t have an account?</p>
        <p className={styles.signUp}>Sign Up</p>
      </div>
    </div>
  );
}

export default Component;
