"use client"
import React, { useState, useEffect } from 'react';
import Submenu from '../menus/submenu/index'
import MainMenu from '../menus/index'

const Header = ({ lng }) => {

    return (
        <>
            <div className="nso_header">
                <Submenu lng={lng} />
                <MainMenu lng={lng} />
            </div>
        </>
    );
};

export default Header;
