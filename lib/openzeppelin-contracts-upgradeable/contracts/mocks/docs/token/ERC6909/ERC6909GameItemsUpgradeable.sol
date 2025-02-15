// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC6909MetadataUpgradeable} from "../../../../token/ERC6909/extensions/draft-ERC6909MetadataUpgradeable.sol";
import {Initializable} from "../../../../proxy/utils/Initializable.sol";

contract ERC6909GameItemsUpgradeable is Initializable, ERC6909MetadataUpgradeable {
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant THORS_HAMMER = 2;
    uint256 public constant SWORD = 3;
    uint256 public constant SHIELD = 4;

    function __ERC6909GameItems_init() internal onlyInitializing {
        __ERC6909GameItems_init_unchained();
    }

    function __ERC6909GameItems_init_unchained() internal onlyInitializing {
        _setDecimals(GOLD, 18);
        _setDecimals(SILVER, 18);
        // Default decimals is 0
        _setDecimals(SWORD, 9);
        _setDecimals(SHIELD, 9);

        _mint(msg.sender, GOLD, 10 ** 18);
        _mint(msg.sender, SILVER, 10_000 ** 18);
        _mint(msg.sender, THORS_HAMMER, 1);
        _mint(msg.sender, SWORD, 10 ** 9);
        _mint(msg.sender, SHIELD, 10 ** 9);
    }
}
