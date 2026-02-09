export default function HostDashboard({ user }: any) {
    return (
        <div>
            <h1>Welcome Host {user.name}</h1>
            <p>Manage your listings & bookings</p>
        </div>
    );
}
