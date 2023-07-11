import React, { useState, useEffect, useRef } from 'react';

import { EnsAvatar, ImageContainer } from './styles';

import { ResetContainer } from '../../../styles';
import { useContext } from '../../ConnectWSC';
import useIsMounted from '../../../hooks/useIsMounted';

type Hash = `0x${string}`;

export type CustomAvatarProps = {
  address?: Hash | undefined;
  ensName?: string | undefined;
  ensImage?: string;
  size: number;
  radius: number;
};

const Avatar: React.FC<{
  address?: Hash | undefined;
  name?: string | undefined;
  size?: number;
  radius?: number;
}> = ({ address, name, size = 96, radius = 96 }) => {
  const isMounted = useIsMounted();
  const context = useContext();

  const imageRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(true);

  const ens = {
    address: address,
    name: name,
    avatar: undefined,
  };

  useEffect(() => {
    if (
      !(
        imageRef.current &&
        imageRef.current.complete &&
        imageRef.current.naturalHeight !== 0
      )
    ) {
      setLoaded(false);
    }
  }, []);

  if (!isMounted)
    return <div style={{ width: size, height: size, borderRadius: radius }} />;

  if (context.options?.customAvatar)
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          overflow: 'hidden',
        }}
      >
        {context.options?.customAvatar({
          address: address ?? ens?.address,
          ensName: name ?? ens?.name,
          ensImage: ens?.avatar,
          size,
          radius,
        })}
      </div>
    );

  if (!ens.name || !ens.avatar)
    return (
      <ResetContainer style={{ pointerEvents: 'none' }}>
        <EnsAvatar $size={size} $seed={ens.address} $radius={radius} />
      </ResetContainer>
    );
  return (
    <ResetContainer style={{ pointerEvents: 'none' }}>
      <EnsAvatar $size={size} $seed={ens.address} $radius={radius}>
        <ImageContainer
          ref={imageRef}
          src={ens.avatar}
          alt={ens.name}
          onLoad={() => setLoaded(true)}
          $loaded={loaded}
        />
      </EnsAvatar>
    </ResetContainer>
  );
};

export default Avatar;
