import React, { useState } from 'react';
import { Flex, Skeleton, Space } from 'antd';
const App = () => {
    return (
        <Flex vertical>
            <Space className='w-full'>
                <Skeleton.Image className="full-width-skeleton-image" />
            </Space>
        </Flex>
    );
};
export default App;