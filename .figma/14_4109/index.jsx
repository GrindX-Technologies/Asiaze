import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.vector8}>
      <img src="../image/moubmr7w-z0ek7xo.svg" className={styles.frame} />
      <div className={styles.vector3}>
        <div className={styles.autoWrapper}>
          <img src="../image/moubmr7w-6nazv6b.svg" className={styles.frame2} />
          <img src="../image/moubmr7w-d8q9f4r.svg" className={styles.frame2} />
          <img src="../image/moubmr7w-tnu0qjh.svg" className={styles.frame3} />
          <img src="../image/moubmr7w-f0ci0yn.svg" className={styles.frame2} />
        </div>
        <img src="../image/moubmr7x-bj2457w.png" className={styles.vector} />
        <p className={styles.reelHeadline}>Reel Headline</p>
        <p className={styles.thisIsASampleCaption}>
          This is a sample caption for the reel preview.
        </p>
        <p className={styles.sourceName2HoursAgo}>Source Name · 2 hours ago</p>
        <div className={styles.vector2} />
      </div>
      <div className={styles.autoWrapper3}>
        <div className={styles.vector4}>
          <p className={styles.reelMetadata}>Reel Metadata</p>
          <p className={styles.title}>Title:</p>
          <p className={styles.sampleReelTitle}>Sample Reel Title</p>
          <p className={styles.caption}>Caption:</p>
          <div className={styles.group}>
            <p className={styles.thisIsADetailedCapti}>
              This is a detailed caption for the reel, providing more context and
            </p>
            <p className={styles.information}>information.</p>
          </div>
          <p className={styles.caption}>Full Article Link:</p>
          <img src="../image/moubmr7w-gp3tmj7.svg" className={styles.maskGroup} />
          <p className={styles.caption}>Category:</p>
          <p className={styles.sampleReelTitle}>Entertainment</p>
          <p className={styles.caption}>Language:</p>
          <p className={styles.sampleReelTitle}>English</p>
          <p className={styles.caption}>Tags:</p>
          <div className={styles.autoWrapper2}>
            <div className={styles.group2}>
              <p className={styles.tag1}>Tag1</p>
            </div>
            <div className={styles.group3}>
              <p className={styles.tag1}>Tag2</p>
            </div>
            <div className={styles.group2}>
              <p className={styles.tag1}>Tag3</p>
            </div>
          </div>
          <p className={styles.sourceDuration}>Source & Duration:</p>
          <p className={styles.sampleReelTitle}>News Network · 2 min read</p>
          <p className={styles.caption}>Status:</p>
          <p className={styles.sampleReelTitle}>Published</p>
        </div>
        <div className={styles.vector7}>
          <div className={styles.vector5}>
            <p className={styles.editReel}>Edit Reel</p>
          </div>
          <div className={styles.vector6}>
            <p className={styles.backToAllReels}>Back to All Reels</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
