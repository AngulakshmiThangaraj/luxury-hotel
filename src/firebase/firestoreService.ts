import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { Room, Customer, Booking, ServiceItem, Invoice, User } from '../types';
import { INITIAL_ROOMS, INITIAL_CUSTOMERS, INITIAL_BOOKINGS, INITIAL_SERVICES } from '../mockData';

// Paths
export const ROOMS_COLLECTION = 'rooms';
export const CUSTOMERS_COLLECTION = 'customers';
export const BOOKINGS_COLLECTION = 'bookings';
export const SERVICES_COLLECTION = 'services';
export const INVOICES_COLLECTION = 'invoices';
export const USERS_COLLECTION = 'users';

/**
 * Seed initial hotel data if collections are currently empty in Firestore
 */
export async function seedInitialFirestoreData(): Promise<void> {
  try {
    const roomsSnap = await getDocs(collection(db, ROOMS_COLLECTION));
    if (roomsSnap.empty) {
      console.log('Seeding initial rooms into Firestore...');
      for (const room of INITIAL_ROOMS) {
        await setDoc(doc(db, ROOMS_COLLECTION, String(room.id)), room);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ROOMS_COLLECTION);
  }

  try {
    const custSnap = await getDocs(collection(db, CUSTOMERS_COLLECTION));
    if (custSnap.empty) {
      console.log('Seeding initial customers into Firestore...');
      for (const customer of INITIAL_CUSTOMERS) {
        await setDoc(doc(db, CUSTOMERS_COLLECTION, String(customer.id)), customer);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CUSTOMERS_COLLECTION);
  }

  try {
    const bookingsSnap = await getDocs(collection(db, BOOKINGS_COLLECTION));
    if (bookingsSnap.empty) {
      console.log('Seeding initial bookings into Firestore...');
      for (const booking of INITIAL_BOOKINGS) {
        await setDoc(doc(db, BOOKINGS_COLLECTION, String(booking.id)), booking);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
  }

  try {
    const servSnap = await getDocs(collection(db, SERVICES_COLLECTION));
    if (servSnap.empty) {
      console.log('Seeding initial services into Firestore...');
      for (const service of INITIAL_SERVICES) {
        await setDoc(doc(db, SERVICES_COLLECTION, String(service.id)), service);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, SERVICES_COLLECTION);
  }
}

// -------------------------------------------------------------
// Real-time Listeners (with mandatory error callbacks per skill)
// -------------------------------------------------------------

export function subscribeRooms(callback: (rooms: Room[]) => void): () => void {
  const colRef = collection(db, ROOMS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as Room);
      items.sort((a, b) => a.id - b.id);
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, ROOMS_COLLECTION);
    }
  );
}

export function subscribeCustomers(callback: (customers: Customer[]) => void): () => void {
  const colRef = collection(db, CUSTOMERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as Customer);
      items.sort((a, b) => a.id - b.id);
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, CUSTOMERS_COLLECTION);
    }
  );
}

export function subscribeBookings(callback: (bookings: Booking[]) => void): () => void {
  const colRef = collection(db, BOOKINGS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as Booking);
      items.sort((a, b) => b.id - a.id);
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
    }
  );
}

export function subscribeServices(callback: (services: ServiceItem[]) => void): () => void {
  const colRef = collection(db, SERVICES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as ServiceItem);
      items.sort((a, b) => a.id - b.id);
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, SERVICES_COLLECTION);
    }
  );
}

// -------------------------------------------------------------
// Room Operations
// -------------------------------------------------------------

export async function saveRoom(room: Room): Promise<void> {
  const path = `${ROOMS_COLLECTION}/${room.id}`;
  try {
    await setDoc(doc(db, ROOMS_COLLECTION, String(room.id)), room, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteRoom(roomId: number): Promise<void> {
  const path = `${ROOMS_COLLECTION}/${roomId}`;
  try {
    await deleteDoc(doc(db, ROOMS_COLLECTION, String(roomId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Customer Operations
// -------------------------------------------------------------

export async function saveCustomer(customer: Customer): Promise<void> {
  const path = `${CUSTOMERS_COLLECTION}/${customer.id}`;
  try {
    await setDoc(doc(db, CUSTOMERS_COLLECTION, String(customer.id)), customer, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCustomer(customerId: number): Promise<void> {
  const path = `${CUSTOMERS_COLLECTION}/${customerId}`;
  try {
    await deleteDoc(doc(db, CUSTOMERS_COLLECTION, String(customerId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Booking Operations
// -------------------------------------------------------------

export async function saveBooking(booking: Booking): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${booking.id}`;
  try {
    await setDoc(doc(db, BOOKINGS_COLLECTION, String(booking.id)), booking, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBooking(bookingId: number): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${bookingId}`;
  try {
    await deleteDoc(doc(db, BOOKINGS_COLLECTION, String(bookingId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Invoice Operations
// -------------------------------------------------------------

export async function saveInvoice(invoice: Invoice): Promise<void> {
  const path = `${INVOICES_COLLECTION}/${invoice.invoiceNumber}`;
  try {
    await setDoc(doc(db, INVOICES_COLLECTION, invoice.invoiceNumber), invoice, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// User Profile Operations
// -------------------------------------------------------------

export async function saveUserProfile(user: User): Promise<void> {
  const uid = user.uid || String(user.id);
  const path = `${USERS_COLLECTION}/${uid}`;
  try {
    await setDoc(doc(db, USERS_COLLECTION, uid), {
      ...user,
      uid,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
