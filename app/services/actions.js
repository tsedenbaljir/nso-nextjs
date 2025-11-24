'use server'

export async function submitContactForm(formData) {
    try {
        const cleanedData = {
            lastName: formData.lastName.trim(),
            firstName: formData.firstName.trim(),
            country: formData.country.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            city: formData.city.trim(),
            district: formData.district.trim(),
            khoroo: formData.khoroo.trim(),
            apartment: formData.apartment.trim(),
            letter: formData.letter.trim(),
        };

        const response = await fetch(`${process.env.BASE_URL}/api/insert/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanedData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Алдаа гарлаа');
        }

        return { success: true };
    } catch (error) {
        console.error('Contact form submission error:', error);
        return { success: false, error: error.message };
    }
}

export async function fetchTableauKey() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    try {
        // Use absolute URL for server-side requests
        const response = await fetch(`${process.env.BASE_URL}/api/tableau-key`, {
            headers: {
                "Content-Type": "application/json",
            },
            cache: 'no-store',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch Tableau key');
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('Tableau key fetch error:', error);
        return { success: false, error: error.message };
    }
} 

export async function fetchHomoHuman(registerNo) {
    try {
        // Use absolute URL for server-side requests
        const response = await fetch(`${process.env.BASE_URL}/api/human`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ registerNo: registerNo }),
            cache: 'no-store',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch Homo Human');
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('Homo Human fetch error:', error);
        return { success: false, error: error.message };
    }
} 
