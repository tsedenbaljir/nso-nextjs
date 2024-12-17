import Link from 'next/link';
// import { Icon } from '@/components/ui/Icon';
import './styles.scss';

export default function ServiceGrid({ services }) {
    return (
        <div className="service-grid">
            {services.map((service) => (
                <Link href={service.link} key={service.id} className="service-item">
                    <div className="service-content">
                        {service.icon}
                        <span className="service-title uppercase">{service.title}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
} 