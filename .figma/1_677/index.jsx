import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.vector4}>
      <img src="../image/mou7xsk3-jz3quoj.png" className={styles.vector} />
      <div className={styles.group}>
        <p className={styles.watchShortNewsReels}>Watch Short News Reels</p>
        <p className={styles.instantly}>Instantly</p>
      </div>
      <p className={styles.scrollThroughQuickVi}>
        Scroll through quick video updates anytime
      </p>
      <div className={styles.autoWrapper}>
        <div className={styles.vector2} />
        <div className={styles.vector2} />
        <div className={styles.vector2} />
      </div>
      <div className={styles.vector3}>
        <p className={styles.getStarted}>Get Started</p>
      </div>
    </div>
  );
}

export default Component;
