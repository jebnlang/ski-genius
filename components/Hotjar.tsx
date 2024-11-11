'use client';

import { useEffect } from 'react';
import hotjar from '@hotjar/browser';

interface HotjarProps {
  siteId: number;
  hotjarVersion: number;
}

export default function Hotjar({ siteId, hotjarVersion }: HotjarProps) {
  useEffect(() => {
    hotjar.init(siteId, hotjarVersion);
  }, [siteId, hotjarVersion]);

  return null;
}