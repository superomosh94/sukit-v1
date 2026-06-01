import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlanData, MemberData } from '../services/api';

interface MembershipStore {
  plans: PlanData[];
  members: MemberData[];
  currentPlan: PlanData | null;
  isLoading: boolean;
  setPlans: (plans: PlanData[]) => void;
  setMembers: (members: MemberData[]) => void;
  setCurrentPlan: (plan: PlanData | null) => void;
  setLoading: (loading: boolean) => void;
  addPlan: (plan: PlanData) => void;
  updatePlan: (id: string, data: Partial<PlanData>) => void;
  removePlan: (id: string) => void;
  addMember: (member: MemberData) => void;
  removeMember: (id: string) => void;
}

export const useMembershipStore = create<MembershipStore>()(
  persist(
    (set) => ({
      plans: [],
      members: [],
      currentPlan: null,
      isLoading: false,

      setPlans: (plans) => set({ plans }),
      setMembers: (members) => set({ members }),
      setCurrentPlan: (plan) => set({ currentPlan: plan }),
      setLoading: (loading) => set({ isLoading: loading }),

      addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
      updatePlan: (id, data) =>
        set((state) => ({
          plans: state.plans.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      removePlan: (id) =>
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
        })),
      addMember: (member) =>
        set((state) => ({ members: [...state.members, member] })),
      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),
    }),
    {
      name: 'sukit-membership-store',
      partialize: (state) => ({ plans: state.plans }),
    }
  )
);
