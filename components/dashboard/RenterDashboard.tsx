export default function RenterDashboard({ user }: any) {
    return (
        <div>
            <h1>Welcome Renter {user.name}</h1>
            <p>View your bookings</p>
        </div>
    );
}
