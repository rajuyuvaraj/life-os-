import React, { useState, useEffect } from 'react';

export default function CountUp({ value, prefix = '', suffix = '', duration = 800 }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const target = parseFloat(value);
        if (isNaN(target) || target <= 0) {
            setCount(value);
            return;
        }

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentVal = progress * target;
            
            // Format to 2 decimal places if target is fractional, else integer
            if (target % 1 === 0) {
                setCount(Math.floor(currentVal));
            } else {
                setCount(currentVal.toFixed(2));
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setCount(target % 1 === 0 ? target : target.toFixed(2));
            }
        };

        window.requestAnimationFrame(step);
    }, [value, duration]);

    return <span>{prefix}{count}{suffix}</span>;
}
