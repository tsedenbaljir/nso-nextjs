'use server'
import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

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

        const response = await fetch(`/api/insert/contact`, {
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
