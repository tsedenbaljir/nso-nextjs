"use client";
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const Group = styled.div`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '100%'};
  position: ${props => props.position || 'relative'};
  left: ${props => props.left || '0'};
  top: ${props => props.top || '0'};
  z-index: ${props => props.zIndex || 'auto'};
  cursor: ${props => props.cursor || 'default'};
`;

const Rectangle = styled.div`
  width: ${props => props.width || '1px'};
  height: ${props => props.height || '1px'};
  left: ${props => props.left || '0'};
  top: ${props => props.top || '0'};
  position: absolute;
  background: ${props => props.bg || '#40AC70'};
  transform: ${props => props.transform || 'none'};
  transform-origin: ${props => props.transformOrigin || '0 0'};
  box-shadow: ${props => props.shadow};
  border-radius: ${props => props.radius};
`;

const Text = styled.div`
  width: ${props => props.width};
  height: ${props => props.height};
  left: ${props => props.left};
  top: ${props => props.top};
  position: absolute;
  text-align: center;
  color: #005BAA;
  font-size: ${props => props.fontSize || '7px'};
 
  font-weight: ${props => props.bold ? '700' : '400'};
  word-wrap: break-word;
  line-height: ${props => props.lineHeight || 'normal'};
`;

export default function OrganizationChart({ t, showDialoggazar, showDialogDaraga }) {
    return (
        <Container>
            <Group className="Group67">
                <Rectangle
                    width="1px"
                    height="76px"
                    left="345px"
                    top="137px"
                    transform="rotate(180deg)"
                    transformOrigin="0 0"
                />
                <Rectangle
                    width="129px"
                    height="1px"
                    left="345px"
                    top="62px"
                    transform="rotate(180deg)"
                    transformOrigin="0 0"
                />
                <Group
                    width="102px"
                    height="30px"
                    left="293px"
                    top="137px"
                    position="absolute"
                    onClick={() => showDialoggazar(20)}
                >
                    <Rectangle
                        width="102px"
                        height="30px"
                        bg="white"
                        shadow="0px 1px 4px rgba(0, 0, 0, 0.25)"
                        radius="4px"
                    />
                    <Text
                        width="88.48px"
                        height="15.79px"
                        left="7px"
                        top="2px"
                    >
                        {t('aboutUsJson.G6')}
                    </Text>
                </Group>
            </Group>

            <Group className="Group64">
                <Group
                    className="Group63"
                    width="376px"
                    height="469px"
                    left="19px"
                    top="17px"
                    position="absolute"
                >
                    {/* G2 Section */}
                    <Group
                        width="102px"
                        height="30px"
                        left="20px"
                        top="287px"
                        position="absolute"
                        zIndex="1"
                        onClick={() => showDialoggazar(24)}
                    >
                        <Rectangle
                            width="102px"
                            height="30px"
                            bg="white"
                            shadow="0px 1px 4px rgba(0, 0, 0, 0.25)"
                            radius="4px"
                        />
                        <Text
                            width="88.48px"
                            height="15.79px"
                            left="6px"
                            top="6px"
                        >
                            {t('aboutUsJson.G2')}
                        </Text>
                    </Group>

                    {/* G1 Section */}
                    <Group
                        width="102px"
                        height="30px"
                        left="20px"
                        top="227px"
                        position="absolute"
                        zIndex="1"
                        onClick={() => showDialoggazar(2)}
                    >
                        <Rectangle
                            width="102px"
                            height="30px"
                            bg="white"
                            shadow="0px 1px 4px rgba(0, 0, 0, 0.25)"
                            radius="4px"
                        />
                        <Text
                            width="88px"
                            height="12.03px"
                            left="6px"
                            top="7px"
                        >
                            {t('aboutUsJson.G1')}
                        </Text>
                    </Group>

                    {/* G1 Subsections */}
                    <Group
                        width="191px"
                        height="45px"
                        left="146px"
                        top="220px"
                        position="absolute"
                    >
                        {/* G1x1 */}
                        <Group
                            width="191px"
                            height="12.74px"
                            position="absolute"
                            zIndex="1"
                            onClick={() => showDialoggazar(6)}
                        >
                            <Rectangle
                                width="191px"
                                height="12.74px"
                                bg="white"
                                shadow="0px 1px 2px rgba(0, 0, 0, 0.25)"
                                radius="2px"
                            />
                            <Text
                                width="164.78px"
                                height="5.11px"
                                left="8px"
                                top="3px"
                                fontSize="5px"
                            >
                                {t('aboutUsJson.G1x1')}
                            </Text>
                        </Group>

                        {/* Continue with other subsections... */}
                    </Group>

                    {/* Continue with other groups (G3, G4, G5, etc.) following the same pattern */}
                    
                    {/* Connecting Lines */}
                    <Rectangle
                        width="1px"
                        height="328px"
                        left="1px"
                        top="421px"
                        transform="rotate(180deg)"
                        transformOrigin="0 0"
                    />
                    {/* Add other connecting lines... */}
                </Group>
            </Group>
        </Container>
    );
} 
