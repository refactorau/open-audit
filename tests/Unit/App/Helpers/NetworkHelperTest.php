<?php

declare(strict_types=1);

namespace OpenAuditTest\Unit\App\Helpers;

use CodeIgniter\Test\CIUnitTestCase;

final class NetworkHelperTest extends CIUnitTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        helper('network');
        helper('utility');
    }

    /**
     * @dataProvider privateIpDataProvider
     */
    public function testPrivateIp(bool $expected, string $ipAddress): void
    {
        $this->assertSame($expected, is_private_ip($ipAddress));
    }

    public static function privateIpDataProvider(): array
    {
        return [
            [true, '192.168.1.1'],
            [true, '10.10.10.10'],
            [false, '110.2.3.5'],
            [false, '123'],
            [false, 'abc'],
            [false, 'bad.address.with.0'],
        ];
    }

    /**
     * @dataProvider ipAddressToDbDataProvider
     */
    public function testIpAddressToDb(string $expected, string $ipAddress): void
    {
        $this->assertSame($expected, ip_address_to_db($ipAddress));
    }

    public static function ipAddressToDbDataProvider(): array
    {
        return [
            ['192.168.001.001', '192.168.1.1'],
            ['010.010.010.010', '10.10.10.10'],
            ['110.002.003.005', '110.2.3.5'],
            ['123', '123'],
            ['abc', 'abc'],
            ['000.000.000.000', 'bad.address.with.0'],
        ];
    }

    /**
     * @dataProvider ipAddressFromDbDataProvider
     */
    public function testIpAddressFromDb(string $expected, string $ipAddress): void
    {
        $this->assertSame($expected, ip_address_from_db($ipAddress));
    }

    public static function ipAddressFromDbDataProvider(): array
    {
        return [
            ['192.168.1.1', '192.168.001.001'],
            ['10.10.10.10', '010.010.010.010'],
            ['110.2.3.5', '110.002.003.005'],
            ['123', '123'],
            ['abc', 'abc'],
            ['0.0.0.0', 'bad.address.with.0'],
        ];
    }

    /**
     * @dataProvider searchIpToDbDataProvider
     */
    public function testSearchIpAToDb(string $expected, string $ipAddress): void
    {
        $this->assertSame($expected, search_ip_to_db($ipAddress));
    }

    public static function searchIpToDbDataProvider(): array
    {
        return [
            ['192.168.001.001', '192.168.1.1'],
            ['010.010.010.010', '10.10.10.10'],
            ['110.002.003.005', '110.2.3.5'],
            ['', '123'],
            ['', 'abc'],
            ['bad.ess.ith.000', 'bad.address.with.0'],
        ];
    }

    public function testIsSsl(): void
    {
        $this->assertFalse(is_ssl());
    }

    public function testServerIp(): void
    {
        $this->assertNotSame('127.0.0.1', server_ip());
    }

    /**
     * @dataProvider checkIpDataProvider
     */
    public function testCheckIp(bool $expected, string $ip): void
    {
        $this->assertSame($expected, check_ip($ip));
    }

    public static function checkIpDataProvider(): array
    {
        return [
            // Loopback and valid IPv6 return true without a DB lookup
            [true,  '127.0.0.1'],
            [true,  '::1'],
            [true,  '2001:db8:0:0:0:ff00:42:8329'],
            // Not a valid IPv4 or IPv6 address
            [false, 'foobar:8329'],
            [false, ''],
        ];
    }
}
