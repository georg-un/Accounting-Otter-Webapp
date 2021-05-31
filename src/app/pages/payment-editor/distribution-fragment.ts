import { User } from '../../core/entity/user';
import { Debit } from '../../core/entity/debit';

export class DistributionFragment {
  user: User;
  amount: number;
  checked: boolean;

  static fromUser(user: User) {
    const distributionFragment = new DistributionFragment();
    distributionFragment.user = user;
    distributionFragment.amount = 0;
    distributionFragment.checked = true;
    return distributionFragment;
  }

  static fromDebit(debit: Debit, user: User) {
    if (user.userId !== debit.debtorId) {
      console.warn('Id of user (' + user.userId.toString() + ') and id of debit (' + debit.debtorId + ') did not match.');
    }
    const distributionFragment = new DistributionFragment();
    distributionFragment.user = user;
    distributionFragment.amount = debit.amount;
    distributionFragment.checked = debit.amount !== 0;
    return distributionFragment;
  }
}
