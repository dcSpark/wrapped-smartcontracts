import React from 'react';
import {
  Graphic,
  LogoGroup,
  Logo,
  FloatWrapper,
  LogoPosition,
  LogoInner,
  LogoGraphic,
  GraphicBackground,
  RotateWrapper,
} from './styles';

import {
  PageContent,
  ModalBody,
  ModalContent,
  ModalH1,
} from '../../Common/Modal/styles';
import Logos from '../../../assets/logos';
import wave from '../../../assets/wave';

import Button from '../../Common/Button';
import useLocales from '../../../hooks/useLocales';
import { useContext } from '../../ConnectWSC';

const Introduction: React.FC = () => {
  const context = useContext();
  const locales = useLocales({});

  const ctaUrl = locales.onboardingScreen_ctaUrl;
  return (
    <PageContent>
      <Graphic>
        <LogoGroup>
          <Logo>
            <LogoPosition>
              <LogoInner>
                <FloatWrapper>
                  <RotateWrapper>
                    <LogoGraphic>
                      <Logos.Flint background />
                    </LogoGraphic>
                  </RotateWrapper>
                </FloatWrapper>
              </LogoInner>
            </LogoPosition>
          </Logo>
          <Logo>
            <LogoPosition>
              <LogoInner>
                <FloatWrapper>
                  <RotateWrapper>
                    <LogoGraphic>
                      <Logos.Flint background />
                    </LogoGraphic>
                  </RotateWrapper>
                </FloatWrapper>
              </LogoInner>
            </LogoPosition>
          </Logo>
          <Logo>
            <LogoPosition>
              <LogoInner>
                <FloatWrapper>
                  <RotateWrapper>
                    <LogoGraphic>
                      <Logos.Flint />
                    </LogoGraphic>
                  </RotateWrapper>
                </FloatWrapper>
              </LogoInner>
            </LogoPosition>
          </Logo>
          <Logo>
            <LogoPosition>
              <LogoInner>
                <FloatWrapper>
                  <RotateWrapper>
                    <LogoGraphic>
                      <Logos.Flint />
                    </LogoGraphic>
                  </RotateWrapper>
                </FloatWrapper>
              </LogoInner>
            </LogoPosition>
          </Logo>
          <Logo>
            <LogoPosition>
              <LogoInner>
                <FloatWrapper>
                  <RotateWrapper>
                    <LogoGraphic>
                      <Logos.Flint />
                    </LogoGraphic>
                  </RotateWrapper>
                </FloatWrapper>
              </LogoInner>
            </LogoPosition>
          </Logo>
        </LogoGroup>
        <GraphicBackground>{wave}</GraphicBackground>
      </Graphic>
      <ModalContent style={{ paddingBottom: 18 }}>
        <ModalH1 $small>{locales.onboardingScreen_h1}</ModalH1>
        <ModalBody>{locales.onboardingScreen_p}</ModalBody>
      </ModalContent>
      <Button href={ctaUrl} arrow>
        {locales.onboardingScreen_ctaText}
      </Button>
    </PageContent>
  );
};

export default Introduction;
