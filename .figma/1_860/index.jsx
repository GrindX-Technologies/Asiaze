import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.vector7}>
      <p className={styles.chooseYourLanguage}>Choose Your Language</p>
      <div className={styles.autoWrapper}>
        <div className={styles.group}>
          <div className={styles.vector}>
            <p className={styles.eN}>EN</p>
          </div>
        </div>
        <div className={styles.vector2}>
          <p className={styles.hIn}>HIN</p>
        </div>
        <div className={styles.group2}>
          <div className={styles.vector3}>
            <p className={styles.eN}>BEN</p>
          </div>
        </div>
      </div>
      <p className={styles.selectYourInterests}>Select Your Interests</p>
      <div className={styles.autoWrapper2}>
        <div className={styles.group3}>
          <div className={styles.vector4}>
            <img src="../image/mou82lon-mubcb2p.svg" className={styles.frame} />
            <p className={styles.politics}>Politics</p>
          </div>
        </div>
        <div className={styles.group5}>
          <div className={styles.group4}>
            <p className={styles.eN}>Sports</p>
          </div>
        </div>
      </div>
      <div className={styles.autoWrapper3}>
        <div className={styles.group7}>
          <div className={styles.group6}>
            <p className={styles.eN}>Business</p>
          </div>
        </div>
        <div className={styles.group9}>
          <div className={styles.group8}>
            <p className={styles.eN}>Tech</p>
          </div>
        </div>
      </div>
      <div className={styles.autoWrapper4}>
        <div className={styles.group11}>
          <div className={styles.group10}>
            <p className={styles.eN}>Lifestyle</p>
          </div>
        </div>
        <div className={styles.group13}>
          <div className={styles.group12}>
            <p className={styles.eN}>Finance</p>
          </div>
        </div>
      </div>
      <div className={styles.autoWrapper5}>
        <div className={styles.group5}>
          <div className={styles.group4}>
            <p className={styles.eN}>Health</p>
          </div>
        </div>
        <div className={styles.group14}>
          <div className={styles.vector5}>
            <img src="../image/mou82lon-uqucen0.svg" className={styles.frame} />
            <img src="../image/mou82lon-h3r3lww.svg" className={styles.maskGroup} />
          </div>
        </div>
      </div>
      <div className={styles.vector6}>
        <p className={styles.hIn}>Continue</p>
      </div>
    </div>
  );
}

export default Component;
