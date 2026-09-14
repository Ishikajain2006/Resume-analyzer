import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './StaggeredMenu.css';

const StaggeredMenu = ({
  items = [],
  buttonLabel = 'Menu',
  className = '',
  bgColor = '#120f17',
  accentColor = '#8400ff',
  textColor = '#ffffff'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      gsap.to(menuRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out'
      });
      gsap.fromTo(
        itemsRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.5)', delay: 0.1 }
      );
    } else {
      gsap.to(itemsRef.current, {
        y: -10,
        opacity: 0,
        duration: 0.3,
        stagger: 0.03,
        ease: 'power2.in'
      });
      gsap.to(menuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        delay: 0.1
      });
    }
  }, [isOpen]);

  return (
    <div className={`staggered-menu-wrapper ${className}`}>
      <button
        className="staggered-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: bgColor, color: textColor, borderColor: `${accentColor}40` }}
      >
        <span>{buttonLabel}</span>
        <div className={`staggered-menu-icon ${isOpen ? 'open' : ''}`}>
          <span style={{ backgroundColor: textColor }} />
          <span style={{ backgroundColor: textColor }} />
          <span style={{ backgroundColor: textColor }} />
        </div>
      </button>

      <div
        className="staggered-menu-dropdown"
        ref={menuRef}
        style={{ backgroundColor: bgColor, borderColor: `${accentColor}40` }}
      >
        <ul className="staggered-menu-list">
          {items.map((item, index) => (
            <li
              key={index}
              ref={el => (itemsRef.current[index] = el)}
              className="staggered-menu-item"
            >
              <a
                href={item.href || '#'}
                style={{ color: textColor }}
                onClick={e => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setIsOpen(false);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StaggeredMenu;

