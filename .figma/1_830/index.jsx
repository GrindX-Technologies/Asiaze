import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.vector3}>
      <p className={styles.verifyYourAccount}>Verify your account</p>
      <div className={styles.group}>
        <p className={styles.enterThe6DigitCodeSe}>
          Enter the 6-digit code sent to your
        </p>
        <p className={styles.emailPhone}>email/phone</p>
      </div>
      <div className={styles.autoWrapper}>
        <div className={styles.group2}>
          <div className={styles.vector} />
        </div>
        <div className={styles.group2}>
          <div className={styles.vector} />
        </div>
        <div className={styles.group2}>
          <div className={styles.vector} />
        </div>
        <div className={styles.group2}>
          <div className={styles.vector} />
        </div>
        <div className={styles.group2}>
          <div className={styles.vector} />
        </div>
        <div className={styles.group2}>
          <div className={styles.vector} />
        </div>
      </div>
      <div className={styles.vector2}>
        <p className={styles.verify}>Verify</p>
      </div>
      <p className={styles.didnTReceiveCodeRese}>Didn't receive code? Resend</p>
    </div>
  );
}

export default Component;
