import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Carousel from '@/components/carousel';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Dashboard', href: dashboard().url } ];

interface PageProps extends SharedData {
	carouselImages: string[];
}

export default function Dashboard() {
	const { carouselImages } = usePage<PageProps>().props;

    return (
			<AppLayout breadcrumbs={breadcrumbs}>
				<Head title="Dashboard" />
				<div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
					<div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
						<main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row gap-8">
							{/* Carousel */}
							<div className="w-full lg:w-3/4">
								{Array.isArray(carouselImages) && carouselImages.length > 0 && (
									<Carousel
										images={carouselImages}
										autoPlay
										interval={4000}
										pauseOnHover
									/>
								)}
							</div>
							{/* Seccion de Texto */}
							<div className="flex flex-col justify-center w-full lg:w-1/4 textcenter lg:text-left">
								<h1 className="text-3xl font-semibold mb-3 dark:text-white">
								Bienvenido/a a SGVSA
								</h1>
								<p className="text-gray-700 dark:text-gray-300">
									Este es un sistema versátil, te permite hacer control de Stock, 
									Ventas y Arqueos de caja.
								</p>
							</div>
						</main>
						</div>
				</div>
			</AppLayout>
    );
}
