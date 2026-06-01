import { useEffect, useRef, useCallback } from 'react';
import { useMembershipStore } from '../stores/membershipStore';
import { membershipApi, PlanData, MemberData } from '../services/api';

export function useMembership() {
  const { plans, isLoading, setPlans, setLoading } = useMembershipStore();

  const fetchPlans = useCallback(
    async (params?: { status?: string }) => {
      setLoading(true);
      try {
        const data = await membershipApi.listPlans(params);
        setPlans(data);
      } finally {
        setLoading(false);
      }
    },
    [setPlans, setLoading]
  );

  const createPlan = useCallback(async (data: PlanData) => {
    const plan = await membershipApi.createPlan(data);
    useMembershipStore.getState().addPlan(plan);
    return plan;
  }, []);

  const updatePlan = useCallback(
    async (id: string, data: Partial<PlanData>) => {
      const plan = await membershipApi.updatePlan(id, data);
      useMembershipStore.getState().updatePlan(id, plan);
      return plan;
    },
    []
  );

  const deletePlan = useCallback(async (id: string) => {
    await membershipApi.deletePlan(id);
    useMembershipStore.getState().removePlan(id);
  }, []);

  return { plans, isLoading, fetchPlans, createPlan, updatePlan, deletePlan };
}

export function useMemberDirectory() {
  const { members, isLoading, setMembers, setLoading } = useMembershipStore();

  const fetchMembers = useCallback(
    async (params?: { search?: string; planId?: string; status?: string }) => {
      setLoading(true);
      try {
        const data = await membershipApi.listMembers(params);
        setMembers(data.members);
      } finally {
        setLoading(false);
      }
    },
    [setMembers, setLoading]
  );

  const createMember = useCallback(async (data: MemberData) => {
    const member = await membershipApi.createMember(data);
    useMembershipStore.getState().addMember(member);
    return member;
  }, []);

  return { members, isLoading, fetchMembers, createMember };
}

export function useMemberPoints() {
  const grantPoints = useCallback(
    async (memberId: string, points: number, reason: string) => {
      await membershipApi.grantPoints(memberId, points, reason);
    },
    []
  );

  return { grantPoints };
}
