import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.vector8}>
      <div className={styles.group}>
        <img src="../image/mou82ig0-elpowmg.png" className={styles.vector} />
      </div>
      <div className={styles.group2}>
        <div className={styles.vector2}>
          <p className={styles.fullName}>Full Name</p>
        </div>
      </div>
      <div className={styles.group3}>
        <div className={styles.vector3}>
          <p className={styles.fullName}>Email or Phone</p>
        </div>
      </div>
      <div className={styles.group4}>
        <div className={styles.vector4}>
          <p className={styles.fullName}>Password</p>
          <img src="../image/mou82ify-euciy6c.svg" className={styles.frame} />
        </div>
      </div>
      <div className={styles.vector5}>
        <p className={styles.signUp}>Sign Up</p>
      </div>
      <div className={styles.autoWrapper}>
        <div className={styles.vector6} />
        <p className={styles.orContinueWith}>Or continue with</p>
        <div className={styles.vector6} />
      </div>
      <div className={styles.group5}>
        <div className={styles.vector7}>
          <p className={styles.google}>Google</p>
        </div>
      </div>
      <div className={styles.autoWrapper2}>
        <p className={styles.orContinueWith}>Already have an account?</p>
        <img src="../image/mou82ify-i7juezp.svg" className={styles.maskGroup} />
      </div>
    </div>
  );
}

export default Component;
