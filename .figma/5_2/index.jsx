import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.searchExploreScreen}>
      <div className={styles.vector8}>
        <div className={styles.group}>
          <div className={styles.vector}>
            <p className={styles.searchNews}>Search news...</p>
          </div>
        </div>
        <div className={styles.vector2} />
        <div className={styles.autoWrapper}>
          <p className={styles.myState}>My State</p>
          <p className={styles.sports}>Sports</p>
          <p className={styles.business}>Business</p>
          <p className={styles.technology}>Technology</p>
          <p className={styles.politics}>Politics</p>
        </div>
        <div className={styles.vector5}>
          <div className={styles.group2}>
            <img src="../image/mou8jo2g-jzo10ax.png" className={styles.vector3} />
          </div>
          <div className={styles.vector4} />
          <div className={styles.group3}>
            <p className={styles.thrillingSoccerMatch}>
              Thrilling Soccer Match Concludes
            </p>
            <p className={styles.withDramaticFinale}>with Dramatic Finale</p>
          </div>
          <div className={styles.group4}>
            <p className={styles.aMatchThatKeptFansOn}>
              A match that kept fans on the edge of their
            </p>
            <p className={styles.seats}>seats...</p>
          </div>
          <p className={styles.eSpn2HoursAgo}>ESPN • 2 hours ago</p>
        </div>
        <div className={styles.group8}>
          <div className={styles.vector7}>
            <div className={styles.vector6} />
            <div className={styles.group5}>
              <p className={styles.thrillingSoccerMatch}>
                Thrilling Soccer Match Concludes
              </p>
              <p className={styles.withDramaticFinale}>with Dramatic Finale</p>
            </div>
            <div className={styles.group6}>
              <p className={styles.aMatchThatKeptFansOn}>
                A match that kept fans on the edge of their
              </p>
              <p className={styles.seats}>seats...</p>
            </div>
            <p className={styles.eSpn2HoursAgo2}>ESPN • 2 hours ago</p>
          </div>
          <div className={styles.group7}>
            <img src="../image/mou8jo2g-7rcd35f.png" className={styles.vector3} />
          </div>
        </div>
      </div>
      <div className={styles.vector10}>
        <div className={styles.vector9} />
        <div className={styles.autoWrapper2}>
          <img src="../image/mou8jo2e-ehd5e5z.svg" className={styles.frame} />
          <img src="../image/mou8jo2e-lfhbnnk.svg" className={styles.frame2} />
          <img src="../image/mou8jo2e-i3axuzo.svg" className={styles.frame3} />
          <img src="../image/mou8jo2e-q1uti75.svg" className={styles.frame} />
        </div>
      </div>
    </div>
  );
}

export default Component;
