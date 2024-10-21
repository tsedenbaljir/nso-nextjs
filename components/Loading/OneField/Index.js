import React, { useState } from 'react';
import { Skeleton, Space } from 'antd';
const App = () => {
    const [size, setSize] = useState('default');
    return (
        <Space className='ml-2'>
            <Skeleton.Input size={size} />
        </Space>
    );
};
export default App;