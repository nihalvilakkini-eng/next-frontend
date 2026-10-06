export default function Footer() {
return ( <footer className="border-t border-slate-200 bg-white"> <div className="mx-auto max-w-7xl px-6 py-8"> <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">


                <div>
                    <h3 className="text-lg font-bold text-slate-900">
                        Product<span className="text-indigo-600">App</span>
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Discover products you’ll love.
                    </p>
                </div>

                <p className="text-sm text-slate-400">
                    © 2026 ProductApp. All rights reserved.
                </p>
            </div>
        </div>
    </footer>
);


}
