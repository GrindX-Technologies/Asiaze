import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.vector3}>
      <div className={styles.vector} />
      <div className={styles.vector2}>
        <img src="../image/moualwmj-3fpc21i.svg" className={styles.maskGroup} />
      </div>
      <div className={styles.group}>
        <p className={styles.innovativeTech}>Innovative Tech</p>
        <p className={styles.trendsToWatchIn}>Trends to Watch in</p>
        <p className={styles.a2023}>2023</p>
      </div>
      <p className={styles.byAsiaZe2HoursAgo}>By AsiaZe · 2 hours ago</p>
      <div className={styles.group2}>
        <p className={styles.diveIntoTheLatestTec}>
          Dive into the latest technological
        </p>
        <p className={styles.advancementsThatAreS}>advancements that are set to</p>
        <p className={styles.advancementsThatAreS}>
          revolutionize industries in 2023. From AI
        </p>
        <p className={styles.advancementsThatAreS}>
          breakthroughs to sustainable tech
        </p>
        <p className={styles.advancementsThatAreS}>
          solutions, explore the innovations
        </p>
        <p className={styles.advancementsThatAreS}>shaping our future.</p>
      </div>
      <div className={styles.autoWrapper}>
        <img src="../image/moualwmj-oqz4gi9.svg" className={styles.frame} />
        <img src="../image/moualwmj-1u6fdon.svg" className={styles.frame2} />
        <img src="../image/moualwmj-afuvfsp.svg" className={styles.frame3} />
      </div>
    </div>
  );
}

export default Component;
