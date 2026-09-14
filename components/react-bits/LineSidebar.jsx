import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import './LineSidebar.css';

const Icon = ({ name, color }) => {
  return (
    <svg className="ls-icon" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {name === 'home' && <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />}
      {name === 'settings' && <circle cx="12" cy="12" r="3" />}
      {name === 'settings' && <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />}
      {name === 'user' && <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />}
      {name === 'user' && <circle cx="12" cy="7" r="4" />}
      {name === 'document' && <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />}
      {name === 'document' && <polyline points="14 2 14 8 20 8" />}
      {name === 'chart' && <line x1="18" y1="20" x2="18" y2="10" />}
      {name === 'chart' && <line x1="12" y1="20" x2="12" y2="4" />}
      {name === 'chart' && <line x1="6" y1="20" x2="6" y2="14" />}
      {!['home', 'settings', 'user', 'document', 'chart'].includes(name) && <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};

const LineSidebar = ({
  items = [],
  activeItem,
  onItemClick,
  className = '',
  accentColor = '#8400ff',
  bgColor = '#120f17',
  textColor = '#ffffff',
  unselectedColor = '#5a5565',
  width = '240px'
}) => {
  const [active, setActive] = useState(activeItem || (items.length > 0 ? items[0].id : null));
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    if (activeItem) {
      setActive(activeItem);
    }
  }, [activeItem]);

  useEffect(() => {
    const activeEl = itemRefs.current[active];
    if (activeEl && activeLineRef.current) {
      const top = activeEl.offsetTop;
      const height = activeEl.offsetHeight;

      gsap.to(activeLineRef.current, {
        y: top,
        height: height,
        duration: 0.4,
        ease: 'power3.out'
      });
    }
  }, [active]);

  const handleItemClick = (id) => {
    setActive(id);
    if (onItemClick) {
      onItemClick(id);
    }
  };

  const handleMouseEnter = (id) => {
    if (id !== active) {
      const el = itemRefs.current[id];
      gsap.to(el.querySelector('.ls-item-bg'), {
        scaleX: 1,
        opacity: 0.1,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(el.querySelector('.ls-label'), {
        x: 4,
        color: textColor,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  const handleMouseLeave = (id) => {
    if (id !== active) {
      const el = itemRefs.current[id];
      gsap.to(el.querySelector('.ls-item-bg'), {
        scaleX: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(el.querySelector('.ls-label'), {
        x: 0,
        color: unselectedColor,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  return (
    <div
      className={`ls-container ${className}`}
      style={{ width, backgroundColor: bgColor }}
      ref={containerRef}
    >
      <div className="ls-line-track">
        <div
          className="ls-active-line"
          ref={activeLineRef}
          style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}80, 0 0 20px ${accentColor}40` }}
        />
      </div>

      <div className="ls-items">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <div
              key={item.id}
              ref={(el) => (itemRefs.current[item.id] = el)}
              className={`ls-item ${isActive ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
              onMouseEnter={() => handleMouseEnter(item.id)}
              onMouseLeave={() => handleMouseLeave(item.id)}
            >
              <div
                className="ls-item-bg"
                style={{
                  backgroundColor: accentColor,
                  transformOrigin: 'left',
                  transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  opacity: isActive ? 0.15 : 0
                }}
              />
              <div className="ls-item-content">
                <div
                  className="ls-icon-wrapper"
                  style={{ color: isActive ? accentColor : unselectedColor }}
                >
                  <Icon name={item.icon} color={isActive ? accentColor : unselectedColor} />
                </div>
                <span
                  className="ls-label"
                  style={{
                    color: isActive ? textColor : unselectedColor,
                    transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                    fontWeight: isActive ? 500 : 400
                  }}
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LineSidebar;

