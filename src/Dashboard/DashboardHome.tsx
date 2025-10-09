import React from 'react';
import useUserRole from '../hooks/useUserRole';
import AdminHome from './Admin/AdminHome';
import RiderHome from './Rider/RiderHome';
import RestaurantOwnerHome from './Restaurant_Owner/RestaurantOwnerHome';

const DashboardHome: React.FC = () => {
    const { isAdmin, isRider, isRestaurantOwner } = useUserRole();
    if (isAdmin) {
        return <>
            <AdminHome />
        </>
    }
    else if (isRider) {
        return <>
            <RiderHome />
        </>
    }
    else if (isRestaurantOwner) {
        return <>
            <RestaurantOwnerHome />
        </>
    }
}

export default DashboardHome;