'use client';

interface ServiceRequestFormProps {
  agencyName: string;
  services: string[];
}

export default function ServiceRequestForm({ agencyName, services }: ServiceRequestFormProps) {
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      service: formData.get('service'),
      message: formData.get('message'),
      agency: agencyName,
      timestamp: new Date().toISOString()
    };

    const existing = localStorage.getItem('serviceRequests');
    const requests = existing ? JSON.parse(existing) : [];
    requests.push(data);
    localStorage.setItem('serviceRequests', JSON.stringify(requests));

    alert('Service request submitted successfully! We will contact you within 24-48 hours.');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <form onSubmit={handleFormSubmit} className="bg-neutral-800 p-4 sm:p-6 rounded-lg border border-neutral-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 sm:py-2 bg-neutral-900 border border-neutral-600 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-3 sm:py-2 bg-neutral-900 border border-neutral-600 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="service" className="block text-sm font-medium text-neutral-300 mb-2">
          Service Required <span className="text-red-500">*</span>
        </label>
        <select
          id="service"
          name="service"
          required
          className="w-full px-4 py-3 sm:py-2 bg-neutral-900 border border-neutral-600 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        >
          <option value="">Select a service</option>
          {services.map((service, index) => (
            <option key={index} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="message" className="block text-sm font-medium text-neutral-300 mb-2">
          Message / Additional Details <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full px-4 py-3 sm:py-2 bg-neutral-900 border border-neutral-600 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          placeholder="Please provide details about your service request..."
        />
      </div>

      <button
        type="submit"
        className="w-full md:w-auto px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
      >
        Submit Service Request
      </button>
    </form>
  );
}
