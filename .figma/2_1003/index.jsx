import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.homeFeedScreenAsiaze}>
      <div className={styles.vector8}>
        <div className={styles.vector2}>
          <p className={styles.myFeed}>My Feed</p>
          <div className={styles.autoWrapper2}>
            <div className={styles.group}>
              <img src="../image/mou86auf-3uwgx5o.png" className={styles.vector} />
            </div>
            <div className={styles.autoWrapper}>
              <p className={styles.videos}>Videos</p>
              <p className={styles.videos}>Business</p>
              <p className={styles.videos}>Tech</p>
            </div>
          </div>
          <p className={styles.finance}>Finance</p>
        </div>
        <div className={styles.group2}>
          <p className={styles.breakingNewsMajorUpd}>
            Breaking News: Major updates from around the world...
          </p>
        </div>
        <div className={styles.group6}>
          <div className={styles.vector5}>
            <div className={styles.autoWrapper3}>
              <div className={styles.group3}>
                <img
                  src="../image/mou86auf-bmolozv.png"
                  className={styles.vector3}
                />
              </div>
              <div className={styles.vector4}>
                <img src="../image/mou86aue-sfpodbk.svg" className={styles.frame} />
                <img src="../image/mou86aue-3uqwpk1.svg" className={styles.frame} />
              </div>
            </div>
            <div className={styles.group4}>
              <p className={styles.emergingTechnologies}>
                Emerging Technologies in Urban
              </p>
              <p className={styles.development}>Development</p>
            </div>
            <div className={styles.group5}>
              <p className={styles.discoverHowEmergingT}>
                Discover how emerging technologies are
              </p>
              <p className={styles.reshapingOurUrbanLan}>
                reshaping our urban landscapes, from smart
              </p>
              <p className={styles.reshapingOurUrbanLan}>
                cities to sustainable architecture. Explore
              </p>
              <p className={styles.reshapingOurUrbanLan}>
                innovative solutions that redefine urban living.
              </p>
            </div>
            <p className={styles.fewHoursAgoAsiaze}>Few hours ago | ASIAZE</p>
          </div>
        </div>
        <div className={styles.vector7}>
          <div className={styles.vector6} />
          <div className={styles.autoWrapper4}>
            <img src="../image/mou86aue-f9o6qv3.svg" className={styles.frame2} />
            <img src="../image/mou86aue-x5tpptg.svg" className={styles.frame3} />
            <img src="../image/mou86aue-g0b5jxh.svg" className={styles.frame4} />
            <img src="../image/mou86aue-j8ke4rn.svg" className={styles.frame2} />
          </div>
        </div>
      </div>
      <p className={styles.entertainment}>Entertainment</p>
    </div>
  );
}

export default Component;
